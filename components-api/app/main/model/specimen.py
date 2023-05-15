# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from tol.api_base.model import Base, db, setup_model


@setup_model
class Specimen(Base):
    __tablename__ = 'specimen'

    class Meta:
        type_ = 'specimens'

    id = db.Column(db.Integer(), primary_key=True)  # noqa A003
    tolid = db.Column(db.String())
    is_complex = db.Column(db.Boolean())
    ready = db.Column(db.Boolean())
    species_id = db.Column(db.Integer(), db.ForeignKey('species.id'))
    species = db.relationship('Species', back_populates='specimen',
                              foreign_keys=[species_id])
    sample = db.relationship('Sample', back_populates='specimen')
