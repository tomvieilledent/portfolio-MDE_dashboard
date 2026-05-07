from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        min_length=8,
        allow_blank=False
    )
    deactivated_by_username = serializers.CharField(
        source='deactivated_by.email',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "uuid",
            "id",
            "email",
            "phone",
            "first_name",
            "last_name",
            "is_active",
            "is_superuser",
            "avatar",
            "business_card",
            "password",
            "date_joined",
            "updated_at",
            "deactivated_by",
            "deactivated_by_username",
            "bio",
        ]
        read_only_fields = ["uuid", "id", "date_joined", "updated_at",
                            "deactivated_by_username", "is_active", "is_superuser"]
        extra_kwargs = {
            "email": {"required": True},
            "phone": {"required": False},
            "first_name": {"required": False},
            "last_name": {"required": False},
            "bio": {"required": False},
            "avatar": {"required": False},
            "business_card": {"required": False},
        }

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value

    def validate(self, data):
        if self.instance is None:
            if "password" not in data or not data.get("password"):
                raise serializers.ValidationError(
                    {"password": "Password is required when creating a user."})
        return data

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        if not password:
            raise serializers.ValidationError(
                {"password": "Password is required."})

        email = validated_data.pop("email")
        username = validated_data.pop("username", email)

        user = User(username=username, email=email, **validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
