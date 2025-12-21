"""Create site_settings table

Revision ID: 002_create_site_settings
Revises: 001_create_showrooms
Create Date: 2024-12-18 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_create_site_settings'
down_revision = '001_create_showrooms'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create site_settings table
    op.create_table(
        'site_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('key', sa.String(), nullable=False),
        sa.Column('value', sa.Text(), nullable=True),
        sa.Column('value_type', sa.String(), nullable=True, server_default='string'),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('category', sa.String(), nullable=True, server_default='general'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create unique index on key
    op.create_index(op.f('ix_site_settings_key'), 'site_settings', ['key'], unique=True)
    op.create_index(op.f('ix_site_settings_category'), 'site_settings', ['category'], unique=False)
    
    # Insert default settings
    op.execute("""
        INSERT INTO site_settings (key, value, value_type, description, category) VALUES
        ('store_name', 'LUXE Catalog', 'string', 'Store/Company name', 'store'),
        ('store_logo', '', 'string', 'Store logo URL', 'store'),
        ('store_email', 'info@luxe.com', 'string', 'Store contact email', 'store'),
        ('store_phone', '', 'string', 'Store contact phone', 'store'),
        ('store_address', '', 'string', 'Store physical address', 'store'),
        ('currency', 'INR', 'string', 'Default currency code', 'general'),
        ('currency_symbol', '₹', 'string', 'Currency symbol', 'general'),
        ('timezone', 'Asia/Kolkata', 'string', 'Store timezone', 'general'),
        ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', 'general'),
        ('user_registration_enabled', 'true', 'boolean', 'Allow new user registration', 'general'),
        ('meta_title', 'LUXE Catalog - Premium Products', 'string', 'SEO meta title', 'seo'),
        ('meta_description', 'Browse our premium catalog of luxury products', 'string', 'SEO meta description', 'seo'),
        ('meta_keywords', 'luxury, premium, catalog', 'string', 'SEO keywords', 'seo'),
        ('social_facebook', '', 'string', 'Facebook page URL', 'seo'),
        ('social_instagram', '', 'string', 'Instagram profile URL', 'seo'),
        ('social_twitter', '', 'string', 'Twitter profile URL', 'seo'),
        ('low_stock_threshold', '10', 'integer', 'Low stock alert threshold', 'product'),
        ('products_per_page', '24', 'integer', 'Number of products per page', 'product'),
        ('max_image_size_mb', '5', 'integer', 'Maximum image upload size in MB', 'product'),
        ('allowed_image_formats', 'jpg,jpeg,png,webp', 'string', 'Allowed image formats', 'product'),
        ('session_timeout_minutes', '30', 'integer', 'User session timeout in minutes', 'security')
    """)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_site_settings_category'), table_name='site_settings')
    op.drop_index(op.f('ix_site_settings_key'), table_name='site_settings')
    
    # Drop table
    op.drop_table('site_settings')

