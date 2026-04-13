"""create records table

Revision ID: ce586b1843b9
Revises: bc3b7e5e6d5d
Create Date: 2026-04-12 23:10:11.164002

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'ce586b1843b9'
down_revision: Union[str, None] = "bc3b7e5e6d5d"  # Revisa a migração anterior (users)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('records',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('venue_id', sa.UUID(), nullable=False),
    sa.Column('rating', sa.Integer(), nullable=False),
    sa.Column('comment', sa.Text(), nullable=True),
    sa.Column('visit_date', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    sa.ForeignKeyConstraint(['venue_id'], ['venues.id']),
    sa.UniqueConstraint('user_id', 'venue_id', name='unique_user_venue_record')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('records')