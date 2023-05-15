# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from tol.api_base.model import Base, db, setup_model


@setup_model
class Species(Base):
    __tablename__ = 'species'

    class Meta:
        type_ = 'species'

    id = db.Column(db.Integer(), primary_key=True)  # noqa A003
    name = db.Column(db.String())
    scientific_name = db.Column(db.String())
    genus = db.Column(db.String())
    family = db.Column(db.String())
    specimen = db.relationship('Specimen', back_populates='species')
