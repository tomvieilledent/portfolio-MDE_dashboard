"""Hourly sync of French economic news from public sources.

Categories:
    réglementation  — JO, BOFiP, URSSAF
    vie-entreprises — BODACC (créations, faillites, cessions)
    opportunités    — BOAMP (marchés publics), subventions
    territoire      — emploi, données territoriales
"""

import logging
from datetime import datetime, timezone
from time import mktime

import feedparser
import requests

from backend.persistence.services.facades.news_facade_sql import NewsFacade

logger = logging.getLogger(__name__)

TIMEOUT = 10  # seconds per source

SOURCES = [
    {
        'name': 'BOAMP',
        'category': 'opportunités',
        'type': 'rss',
        'url': 'https://www.boamp.fr/avis/feed/',
    },
    {
        'name': 'Journal Officiel',
        'category': 'réglementation',
        'type': 'rss',
        'url': 'https://www.legifrance.gouv.fr/feeds/jorf',
    },
    {
        'name': 'BOFiP',
        'category': 'réglementation',
        'type': 'rss',
        'url': 'https://bofip.impots.gouv.fr/bofip/rss/actualites',
    },
    {
        'name': 'URSSAF',
        'category': 'réglementation',
        'type': 'rss',
        'url': 'https://www.urssaf.fr/portail/files/live/sites/urssalfr/files/rss/ActualitesDerniers.xml',
    },
    {
        'name': 'BODACC',
        'category': 'vie-entreprises',
        'type': 'bodacc',
    },
]


def _parse_date(parsed_time):
    """Convert feedparser time tuple to UTC datetime."""
    if not parsed_time:
        return None
    try:
        return datetime.fromtimestamp(mktime(parsed_time), tz=timezone.utc)
    except Exception:
        return None


def _fetch_rss(source, facade):
    feed = feedparser.parse(source['url'])
    if feed.bozo and not feed.entries:
        logger.warning("RSS %s: parse error — %s", source['name'], feed.bozo_exception)
        return 0
    count = 0
    for entry in feed.entries[:20]:
        url = entry.get('link', '').strip()
        if not url or facade.url_exists(url):
            continue
        title = entry.get('title', '').strip()
        if not title:
            continue
        summary = (entry.get('summary') or entry.get('description') or '').strip()
        facade.create(
            title=title[:500],
            source=source['name'],
            summary=summary[:2000] or None,
            url=url,
            published_at=_parse_date(entry.get('published_parsed')),
            category=source['category'],
        )
        count += 1
    return count


def _fetch_bodacc(facade):
    """Fetch latest BODACC announcements (créations, faillites, cessions)."""
    url = (
        'https://bodacc-datadila.opendatasoft.com/api/explore/v2.1'
        '/catalog/datasets/annonces-commerciales/records'
    )
    params = {'limit': 20, 'order_by': 'dateparution desc', 'timezone': 'UTC'}
    try:
        resp = requests.get(url, params=params, timeout=TIMEOUT)
        resp.raise_for_status()
    except Exception as exc:
        logger.warning("BODACC request failed: %s", exc)
        return 0

    count = 0
    for record in resp.json().get('results', []):
        num = record.get('numenregistrement', '').strip()
        if not num:
            continue
        canonical_url = f"https://www.bodacc.fr/pages/annonces-commerciales-detail/?q.id=id:{num}"
        if facade.url_exists(canonical_url):
            continue

        nom = record.get('nomEntreprise', '').strip()
        famille = record.get('familleavis', '').strip()
        type_avis = record.get('typeavis', '').strip()
        tribunal = record.get('tribunal', '').strip()
        pub = record.get('publicationavis', '').strip()
        date_str = record.get('dateparution', '')

        title = ' — '.join(filter(None, [famille, nom or type_avis]))
        if not title:
            continue

        published_at = None
        if date_str:
            try:
                published_at = datetime.fromisoformat(date_str)
                if published_at.tzinfo is None:
                    published_at = published_at.replace(tzinfo=timezone.utc)
            except Exception:
                pass

        summary_parts = filter(None, [type_avis, tribunal, pub])
        facade.create(
            title=title[:500],
            source='BODACC',
            summary=' | '.join(summary_parts)[:2000] or None,
            url=canonical_url,
            published_at=published_at,
            category='vie-entreprises',
        )
        count += 1
    return count


def sync_all():
    """Fetch all sources and store new items. Returns total inserted count."""
    facade = NewsFacade()
    total = 0
    for source in SOURCES:
        try:
            if source['type'] == 'rss':
                n = _fetch_rss(source, facade)
            elif source['type'] == 'bodacc':
                n = _fetch_bodacc(facade)
            else:
                n = 0
            logger.info("news_sync: %s → %d new items", source['name'], n)
            total += n
        except Exception as exc:
            logger.error("news_sync: %s failed — %s", source['name'], exc)
    return total
