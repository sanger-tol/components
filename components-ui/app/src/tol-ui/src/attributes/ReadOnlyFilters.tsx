import { IFilter, IRemoteTarget } from "src/interfaces";
import { AttributeTitle } from "./AttributeTitle";
import { generateFilterDescriptions } from "./utils";

interface PReadOnlyFilters extends IRemoteTarget {
  filter: IFilter
}

export function ReadOnlyFilters(props: PReadOnlyFilters) {
  const { filter, objectType, dataSource } = props;

  const filterDescriptions = generateFilterDescriptions(filter);

  return (
    <div>
      {filterDescriptions && Object.entries(filterDescriptions).map(([attribute, prose]) => (
        <AttributeTitle
          objectType={objectType}
          dataSource={dataSource}
          field={`${attribute} ${prose}`}
        />
      ))}
    </div>
  )
}
