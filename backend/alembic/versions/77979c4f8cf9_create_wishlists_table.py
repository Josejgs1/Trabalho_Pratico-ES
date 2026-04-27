"""create wishlists table

Revision ID: 77979c4f8cf9
Revises: ce586b1843b9
Create Date: 2026-04-27 15:37:49.510182

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '77979c4f8cf9'
down_revision: Union[str, None] = 'ce586b1843b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('wishlists',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('venue_id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    sa.ForeignKeyConstraint(['venue_id'], ['venues.id']),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', 'venue_id', name='unique_user_venue_wishlist')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('wishlists')
