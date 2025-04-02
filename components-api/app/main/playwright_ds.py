# SPDX-FileCopyrightText: 2025 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from __future__ import annotations

from typing import Iterable

from tol.core import (
    DataObject,
    DataSource,
    DataSourceFilter,
)
from tol.core.operator import (
    DetailGetter,
    PageGetter,
)


class PlaywrightTestDataSource(
    DataSource,
    DetailGetter,
    PageGetter,
):
    """
    Used in playwright tests for dashoarding.

    Delegates to the given `ElasticDataSource` for
    other types.
    """

    def __init__(self):
        super().__init__({})

    @property
    def supported_types(self) -> list[str]:
        return [
            'playwright'
        ]

    @property
    def attribute_types(self) -> dict[str, dict[str, str]]:
        return {
            'playwright': {
                'fizz': 'boolean',  # multiple of 3
                'buzz': 'boolean',  # multiple of 5
                'a_max_10': 'str'
            }
        }

    @property
    def attribute_metadata(
        self,
    ) -> dict[str, dict[str, dict[str, str | bool | None]]]:

        return {
            'playwright': {
                'fizz': {
                    'python_type': 'boolean',
                    'display_name': 'Fizz'
                },
                'buzz': {
                    'python_type': 'boolean',
                    'display_name': 'Buzz'
                },
                'a_max_10': {
                    'python_type': 'str',
                    'display_name': "A number of A's not exeeding 10"
                },
            }
        }

    def get_by_id(
        self,
        object_type: str,
        object_ids: Iterable[str],
        **kwargs
    ) -> Iterable[DataObject | None]:

        return (
            self.__get_playwright_object(
                object_id,
                object_type=object_type
            )
            for object_id in object_ids
        )

    def get_list_page(
        self,
        object_type: str,
        page_number: int,
        page_size: int | None = None,
        object_filters: DataSourceFilter | None = None,
        sort_by: str | None = None,
        **kwargs,
    ) -> tuple[Iterable[DataObject], int]:

        ids = list(
            self.__get_filtered_ids(
                object_filters
            )
        )

        limit = page_size if page_size is not None else self.page_size
        offset = (page_number - 1) * limit

        ids_page = ids[offset:offset + limit]
        objs = self.get_by_ids(object_type, ids_page)

        return objs, len(ids)

    def __get_filtered_ids(
        self,
        object_filters: DataSourceFilter | None,
    ) -> Iterable[int]:

        iter_int = list(range(150))

        if object_filters is None or not object_filters.and_:
            yield from iter_int
            return

        fizz_term = self.__get_bool_term(object_filters, 'fizz')
        buzz_term = self.__get_bool_term(object_filters, 'buzz')

        for in_int in iter_int:
            if not self.__filter_by_fizzbuzz(
                in_int,
                fizz_term,
                buzz_term,
            ):
                continue

            yield in_int

    def __get_bool_term(
        self,
        object_filters: DataSourceFilter | None,
        key: str
    ) -> bool | None:

        body = object_filters.and_.get(key, {}).get('in_list')
        if not body:
            return None

        value = body.get('value')
        negate = body.get('negate', False)

        # TODO these should not be strings from the frontend
        is_false = 'false' in value
        is_true = 'true' in value

        if is_false == is_true:
            return None

        is_match = is_true or not is_false

        return not is_match if negate else is_match

    def __filter_by_fizzbuzz(
        self,
        in_int: int,
        fizz_term: bool | None,
        buzz_term: bool | None,
    ) -> bool:

        fizz_okay = self.__filter_by_factor(3, in_int, fizz_term)
        buzz_okay = self.__filter_by_factor(5, in_int, buzz_term)

        return fizz_okay and buzz_okay

    def __filter_by_factor(
        self,
        factor: int,
        in_int: int,
        bool_term: bool | None
    ) -> bool:

        if bool_term is None:
            return True

        is_factor = in_int % factor == 0  # noqa S001

        return is_factor if bool_term else not is_factor

    def __get_playwright_object(
        self,
        object_id: str,
        object_type: str = 'playwright'
    ) -> DataObject:

        int_id = int(object_id)
        fizz = int_id % 3 == 0
        buzz = int_id % 5 == 0
        a_max_10 = 'A' * min(int_id, 10)

        return self.data_object_factory(
            object_type,
            object_id,
            {
                'fizz': fizz,
                'buzz': buzz,
                'a_max_10': a_max_10
            }
        )
