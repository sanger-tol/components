/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Checkbox, CheckPicker as RSCheckPicker } from "rsuite";
import { isPropDefined } from "../general/Utils";
import { RSForm } from "../index";


interface Data {
  label: string,
  value: string
}

interface Props {
  sticky?: boolean;
  block?: boolean;
  data: string[]|Data[];
  value: string[];
  setValue: any;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  open?: boolean;
  onOpen?: any;
  onEntering?: any;
  onClose?: any;
  onClick?: any;
  renderMenuItem?: any;
  renderValue?: any;
  noSearch?: boolean;
  noSelectAll?: boolean;
  label?: string;
  disabledItemValues?: string[];
  searchBy?: (keyword: string, label: any, item: any) => boolean;
}

function MultipleSelect(props: Props) {
  const {
    sticky,
    data,
    value,
    setValue,
    placeholder,
    disabled,
    loading,
    open,
    onOpen,
    onEntering,
    onClose,
    onClick,
    renderMenuItem,
    renderValue,
    noSearch,
    noSelectAll,
    label,
    disabledItemValues,
    searchBy
  } = props;
  const block = isPropDefined(props.block);

  const formattedData: any = data.length > 0 && typeof data[0] === "string"
    ? data.map((i) => ({ label: i, value: i }))
    : data;

  const allValues = formattedData.map((item) => item.value);

  const handleCheckAll = () => {
    setValue(value.length === allValues.length ? [] : allValues);
  };

  const selectAll = () => {
    if (data.length === 0) return undefined;
    return (
      <div>
        <Checkbox
          indeterminate={value.length > 0 && value.length < allValues.length}
          checked={value.length === allValues.length}
          onChange={handleCheckAll}
        >
          Select all
        </Checkbox>
      </div>
    );
  };

  return (
    <>
      {label && <RSForm.ControlLabel>{label}</RSForm.ControlLabel>}
      <span onClick={onClick}>
        <RSCheckPicker
          sticky={sticky}
          searchable={!noSearch}
          countable
          block={block}
          value={value}
          data={formattedData}
          placeholder={placeholder}
          disabled={disabled}
          onChange={setValue}
          loading={loading}
          open={open}
          onOpen={onOpen}
          onEntering={onEntering}
          onClose={onClose}
          renderExtraFooter={noSelectAll ? undefined : selectAll}
          renderMenuItem={renderMenuItem}
          renderValue={renderValue}
          disabledItemValues={disabledItemValues}
          searchBy={searchBy}
        />
      </span>
    </>
  );
}

export default MultipleSelect;
