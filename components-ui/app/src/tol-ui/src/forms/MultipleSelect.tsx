/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Checkbox, CheckPicker as RSCheckPicker } from "rsuite";
import {
  RSForm,
  isPropDefined,
  IData,
  FormLabel,
  IFormLabelIcon
} from "..";


export interface PMultipleSelect {
  sticky?: boolean;
  block?: boolean;
  data: string[] | IData[];
  value: string[];
  setValue: any;
  errorText?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  open?: boolean;
  onOpen?: any;
  onEntering?: any;
  onClose?: any;
  onClean?: any;
  onClick?: any;
  renderMenuItem?: any;
  renderValue?: any;
  noSearch?: boolean;
  noSelectAll?: boolean;
  label?: string;
  disabledItemValues?: string[];
  searchBy?: (keyword: string, label: any, item: any) => boolean;
  caretAs?: any;
  renderExtraFooter?: any;
  className?: string;
  onExit?: any;
  onExiting?: any;
  groupBy?: string;
  icon?: IFormLabelIcon;
  renderMenu?: (menuItem: JSX.Element) => JSX.Element;
}

export function MultipleSelect(props: PMultipleSelect) {
  const {
    sticky,
    data,
    value,
    setValue,
    errorText,
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
    label,
    disabledItemValues,
    searchBy,
    caretAs,
    renderExtraFooter,
    className,
    groupBy,
    icon,
    renderMenu
  } = props;
  const block = isPropDefined(props.block);

  const formattedData: any =
    data.length > 0 && typeof data[0] === "string"
      ? data.map((i) => ({ label: i, value: i }))
      : data;

  const allValues = formattedData.map((item) => item.value);

  const handleCheckAll = () => {
    setValue(value.length === allValues.length ? [] : allValues);
  };

  const selectAll = () => {
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
    <RSForm.Group controlId="formMultipleSelect" as="span">
      <FormLabel label={label} icon={icon} />
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
          renderExtraFooter={selectAll}
          renderMenuItem={renderMenuItem}
          renderValue={renderValue}
          disabledItemValues={disabledItemValues}
          searchBy={searchBy}
          caretAs={caretAs}
          className={className}
        />
      </span>
      {/*
        If there is a multiple select toggle filter, MultipleSelect being an RSForm.Group
        pushes it downwards. To fix this, MultipleSelect has been made a span. This fixed the
        filter but made the error message too high up, so this class moves it back down again
        See `_form.scss`
      */}
      <span className="tol-multiple-select-error-message">
        <RSForm.ErrorMessage show={Boolean(errorText)} placement="bottomStart">{errorText}</RSForm.ErrorMessage>
      </span>
    </RSForm.Group>
  );
}
