/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Checkbox, CheckPicker as RSCheckPicker } from "rsuite";
import { isPropDefined } from "../general/Utils";
import { RSForm } from "../index";

interface Props {
  block?: boolean;
  data: string[];
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
  label?: string;
}

function MultipleSelect(props: Props) {
  const {
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
    label,
  } = props;
  const block = isPropDefined(props.block);

  const formattedData = data.map((item) => ({ label: item, value: item }));

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
          renderExtraFooter={selectAll}
          renderMenuItem={renderMenuItem}
          renderValue={renderValue}
        />
      </span>
    </>
  );
}

export default MultipleSelect;
