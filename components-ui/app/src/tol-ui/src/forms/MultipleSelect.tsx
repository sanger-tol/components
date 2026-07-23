/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Checkbox, CheckPicker as RSCheckPicker } from "rsuite";

import {
  isPropDefined,
  FormComponentWrapper,
} from "..";
import type {
  IData,
  TFormMultipleSelectField,
} from "..";

export interface PMultipleSelect extends TFormMultipleSelectField {
  name?: string;
  value: string[];
  setValue: React.Dispatch<React.SetStateAction<string[]>>;
  errorText?: string;
  renderExtraFooter?: React.ReactNode;
  renderMenu?: (menuItem: JSX.Element) => JSX.Element;
  menuClassName?: string;
}

export function MultipleSelect(props: PMultipleSelect) {
  const {
    name,
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
    onClean,
    onClick,
    renderMenuItem,
    renderValue,
    noSearch,
    noSelectAll,
    disabledItemValues,
    searchBy,
    caretAs,
    renderExtraFooter,
    className,
    menuClassName,
    groupBy,
    renderMenu,
  } = props;
  const block = isPropDefined(props.block);

  const formattedData: IData[] = data.map((item) =>
    typeof item === "string" ? { label: item, value: item } : item,
  );

  const allValues = formattedData.map((item) => item.value);

  const handleCheckAll = () => {
    setValue(value.length === allValues.length ? [] : allValues);
  };

  const renderSelectAllCheckbox = () => {
    if (data.length === 0) return undefined;
    return (
      <>
        {!noSelectAll && (
          <div>
            <Checkbox
              indeterminate={
                value.length > 0 && value.length < allValues.length
              }
              checked={value.length === allValues.length}
              onChange={handleCheckAll}
            >
              Select all
            </Checkbox>
          </div>
        )}
        {renderExtraFooter && <div>{renderExtraFooter}</div>}
        {noSelectAll && !renderExtraFooter && undefined}
      </>
    );
  };

  return (
    <FormComponentWrapper
      {...props}
      id={name}
      as="span"
      errorMessageClassName="tol-multiple-select-error-message"
    >
      <span onClick={onClick}>
        <RSCheckPicker
          groupBy={groupBy}
          sticky={sticky}
          searchable={!noSearch}
          countable
          block={block}
          value={value}
          renderMenu={renderMenu}
          data={formattedData}
          placeholder={placeholder}
          disabled={disabled}
          onChange={setValue}
          loading={loading}
          open={open}
          onOpen={onOpen}
          onEntering={onEntering}
          onClose={onClose}
          onClean={onClean}
          renderExtraFooter={renderSelectAllCheckbox}
          renderMenuItem={renderMenuItem}
          renderValue={renderValue}
          disabledItemValues={disabledItemValues}
          searchBy={searchBy}
          caretAs={caretAs}
          className={className}
          menuClassName={menuClassName}
        />
      </span>
    </FormComponentWrapper>
  );
}
