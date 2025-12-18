"""Create showrooms table

Revision ID: 001_create_showrooms
Revises: 
Create Date: 2024-12-18 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_create_showrooms'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create showrooms table
    op.create_table(
        'showrooms',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('city', sa.String(), nullable=False),
        sa.Column('state', sa.String(), nullable=False),
        sa.Column('zip_code', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('opening_hours', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('map_url', sa.String(), nullable=True),
        sa.Column('gallery_images', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index on name for faster lookups
    op.create_index(op.f('ix_showrooms_name'), 'showrooms', ['name'], unique=False)


def downgrade() -> None:
    # Drop index
    op.drop_index(op.f('ix_showrooms_name'), table_name='showrooms')
    
    # Drop table
    op.drop_table('showrooms')

