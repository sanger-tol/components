import { IFilter, IRemoteTarget } from "src/interfaces";

interface PReadOnlyFilters extends IRemoteTarget {
    filter: IFilter
}

export function ReadOnlyFilters(props: PReadOnlyFilters) {
    const { filter, objectType, dataSource } = props;
}
