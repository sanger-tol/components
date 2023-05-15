# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from tol.api_base.model import LogBase, db, setup_model


@setup_model
class Sample(LogBase):
    __tablename__ = 'sample'

    class Meta:
        type_ = 'samples'

    id = db.Column(db.Integer(), primary_key=True)  # noqa A003
    tube_id = db.Column(db.String())
    acceptance_status = db.Column(db.String())
    risk_status = db.Column(db.String())
    shipping_status = db.Column(db.String())
    specimen_id = db.Column(db.Integer(), db.ForeignKey('specimen.id'))
    specimen = db.relationship('Specimen', back_populates='sample',
                               foreign_keys=[specimen_id])
