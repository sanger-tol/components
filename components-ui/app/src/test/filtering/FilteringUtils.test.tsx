/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, describe, vitest } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useState } from 'react';
import {
  getComponentsAbove,
  getComponentsBelow,
  filterHasUpdated,
  mergeAndFilters,
  generateFilter,
  addValueBelow,
  addComponentBelow,
  resetAllFilters,
  removeComponent,
  addSubFilter,
  resetZone,
  setFilter,
  filterListener
} from '../../tol-ui/src/filtering/Utils'
import { Zone } from '../../tol-ui/src/board/Utils';
import { IFilter } from '../../tol-ui/src/models/Filter';


describe ('Testing getComponentsAbove function', () => {
  test('Returns correct values above', () => {
    const testCall1 = getComponentsAbove('id', ['id', 'id2', 'id3', 'id4', 'id5'])
    expect(testCall1).toEqual(['id'])
    const testCall2 = getComponentsAbove('id3', ['id', 'id2', 'id3', 'id4', 'id5'])
    expect(testCall2).toEqual(['id', 'id2', 'id3'])
    const testCall3 = getComponentsAbove('id5', ['id', 'id2', 'id3', 'id4', 'id5'])
    expect(testCall3).toEqual(['id', 'id2', 'id3', 'id4', 'id5'])
  })

  test('Returns empty array if id not found', () => {
    const testCall1 = getComponentsAbove('id6', ['id', 'id2', 'id3', 'id4', 'id5'])
    expect(testCall1).toEqual([])
  })
})

describe ('Testing getComponentsBelow function', () => {
  test('Returns correct values below', () => {
    const testCall1 = getComponentsBelow('id', ['id', 'id2', 'id3', 'id4', 'id5'])
    expect(testCall1).toEqual(['id2', 'id3', 'id4', 'id5'])
    const testCall2 = getComponentsBelow('id3', ['id', 'id2', 'id3', 'id4', 'id5'])
    expect(testCall2).toEqual(['id4', 'id5'])
    const testCall3 = getComponentsBelow('id5', ['id', 'id2', 'id3', 'id4', 'id5'], -1)
    expect(testCall3).toEqual(['id5'])
  })

  test('Returns empty array if id not found', () => {
    const testCall1 = getComponentsBelow('id6', ['id', 'id2', 'id3', 'id4', 'id5'])
    expect(testCall1).toEqual([])
  })
})

describe ('Testing filterHasUpdated function', () => {
  test('Returns false if incoming filter is undefined', () => {
    const mockSetFilter = vitest.fn();
    const testCall1 = filterHasUpdated(mockSetFilter, {}, undefined)
    expect(testCall1).toEqual(false)
    expect(mockSetFilter).toHaveBeenCalledWith(undefined)
  })

  test('Returns true if incoming filter is different from existing filter', () => {
    const mockSetFilter = vitest.fn();
    const testCall1 = filterHasUpdated(mockSetFilter, {a: 1, b: 2}, {a: 1, b: 2})
    expect(testCall1).toEqual(false)
    expect(mockSetFilter).not.toHaveBeenCalled()
    const testCall2 = filterHasUpdated(mockSetFilter, {a: 1, b: 2}, {a: 1, b: 3})
    expect(testCall2).toEqual(true)
    expect(mockSetFilter).toHaveBeenCalledWith({a: 1, b: 3})
  })
})

describe ('Testing mergeAndFilters function', () => {
  test('Merges two filters correctly', () => {
    const mockFilter1 = {
      "mlwh_run_id": {
          "contains": {
              "value": "123",
              "negate": false
          }
      }
    }

    const mockFilter2 = {
      "mlwh_species.sts_scientific_name": {
          "contains": {
              "value": "123",
              "negate": false
          }
      }
    }

    const expectedFilterValue1 = {
      "mlwh_run_id": {
          "contains": {
              "value": "123",
              "negate": false
          }
      },
      "mlwh_species.sts_scientific_name": {
          "contains": {
              "value": "123",
              "negate": false
          }
      }
    }

    const expectedFilterValue2 = {
      "mlwh_run_id": {
          "contains": {
              "value": "123",
              "negate": false
          }
      }
    }

    const testCall1 = mergeAndFilters(mockFilter1, mockFilter2)
    expect(testCall1).toEqual(expectedFilterValue1)

    const testCall2 = mergeAndFilters(mockFilter1, mockFilter1)
    expect(testCall2).toEqual(expectedFilterValue2)

    const testCall3 = mergeAndFilters(mockFilter1, {})
    expect(testCall3).toEqual(expectedFilterValue2)
  })

  test('Merges two filters correctly with same id', () => {
    const mockFilter1 = {
      "mlwh_run_id": {
          "contains": {
              "value": "123",
              "negate": false
          }
      }
    }

    const mockFilter2 = {
      "mlwh_run_id": {
          "contains": {
              "value": "456",
              "negate": false
          }
      }
    }

    const expectedFilterValue1 = {
      "mlwh_run_id": {
          "contains": {
              "value": "123",
              "negate": false
          }
      }
    }

    const testCall1 = mergeAndFilters(mockFilter2, mockFilter1)
    expect(testCall1).toEqual(expectedFilterValue1)
  })
})

describe ('Testing generateFilter function', () => {
  test('Generates filter correctly', () => {

    const filterValue1: IFilter = {
      and_: {
        attribute1: {
          op1: {
            value: 10,
            negate: false
          }
        }
      }
    }

    const filterValue2: IFilter = {
      and_: {
        attribute1: {
          op2: {
            value: 20,
            negate: false
          }
        }
      }
    }

    const mockZone: Zone = {
      components: {
        'component1': {
          data: {
            filter: filterValue1
          }
        },
        'component2': {
          data: {
            filter: filterValue2
          }
        }
      },
      order: ['component1', 'component2'],
      type: 'dashboard'
    };

    const expectedCombined: IFilter = {
      and_: {
        attribute1: {
          op1: {
            value: 10,
            negate: false
          },
          op2: {
            negate: false,
            value: 20
          }
        }
      }
    }

    const testCall1 = generateFilter(mockZone, 'component1', false)
    expect(testCall1).toEqual(filterValue1)

    const testCall2 = generateFilter(mockZone, 'component2', false)
    expect(testCall2).toEqual(expectedCombined)
  })

  test('Generates filter correctly including subFilter', () => {

    const subFilterValue: IFilter = {
      and_: {
        attribute2: {
          operator2: {
            value: 20,
            negate: true
          }
        }
      }
    }

    const filterValue: IFilter = {
      and_: {
        attribute1: {
          operator1: {
            value: 10,
            negate: false
          }
        }
      }
    }

    const combinedFilterValue: IFilter = {
      and_: {
        attribute1: {
          operator1: {
            value: 10,
            negate: false
          }
        },
        attribute2: {
          operator2: {
            value: 20,
            negate: true
          }
        }
      }
    }

    const mockZone: Zone = {
      components: {
        'component1': {
          data: {
            id: 'component1',
            filter: filterValue,
            subFilter: subFilterValue
          }
        }
      },
      order: ['component1'],
      type: 'dashboard'
    };

    const testCall1 = generateFilter(mockZone, 'component1', true)
    expect(testCall1).toEqual(combinedFilterValue)
  })

})

describe ('Testing addValueBelow function', () => {
  test('Adds value below id correctly', () => {
    const testCall1 = addValueBelow('id', 'value', ['id', 'id2', 'id3', 'id4', 'id5'])
    expect(testCall1).toEqual(['id', 'value', 'id2', 'id3', 'id4', 'id5'])
    const testCall2 = addValueBelow('id3', 'value', ['id', 'id2', 'id3', 'id4', 'id5'])
    expect(testCall2).toEqual(['id', 'id2', 'id3', 'value', 'id4', 'id5'])
    const testCall3 = addValueBelow('id5', 'value', ['id', 'id2', 'id3', 'id4', 'id5'])
    expect(testCall3).toEqual(['id', 'id2', 'id3', 'id4', 'id5', 'value'])
  })
})

describe ('Testing addComponentBelow function', () => {
  test('Adds component below id correctly', () => {
    const mockZone = {
      components: {
        'id': {
          data: {
            filterPassThrough: false
          }
        }
      },
      order: ['id']
    }

    addComponentBelow('id', 'newId', mockZone)
    expect(mockZone.components).toHaveProperty('newId')
    expect(mockZone.components['newId']).toBeDefined()
    expect(mockZone.components['newId'].data.filterPassThrough).toEqual(false)
    expect(mockZone.order).toEqual(['id', 'newId'])
  })
})

describe ('Testing resetAllFilters function', () => {

  const expectedFilterValue: IFilter = {
    and_: {
      attribute1: {
        operator1: {
          value: 'value1',
          negate: false
        },
        operator2: {
          value: 'value2',
          negate: true
        }
      },
      attribute2: {
        operator1: {
          value: 10,
          negate: false
        }
      }
    }
  }

  const expectedDefaultFilterValue: IFilter = {
    and_: {
      DefaultAttribute: {
        operator1: {
          value: 10,
          negate: false
        }
      }
    }
  }

  test('Resets all filters correctly', () => {
    const mockZone: Zone = {
      components: {
        'component1': {
          data: {
            id: 'component1',
            filter: expectedFilterValue,
            subFilter: {and_: {attribute1: {operator1: {value: 'value1', negate: false}}}}
          }
        }
      },
      order: ['component1'],
      type: 'dashboard'
    };

    resetAllFilters(mockZone)
    expect(mockZone.components['component1'].data.filter).toEqual({})
    expect(mockZone.components['component1'].data.subFilter).toEqual(undefined)
  })

  test('Resets all filters correctly with default filter', () => {
    const mockZone: Zone = {
      components: {
        'component1': {
          data: {
            id: 'component1',
            filter: expectedFilterValue,
            defaultFilter: expectedDefaultFilterValue,
            subFilter: {and_: {attribute1: {operator1: {value: 'value1', negate: false}}}}
          }
        }
      },
      order: ['component1'],
      type: 'dashboard'
    };

    resetAllFilters(mockZone)
    expect(mockZone.components['component1'].data.filter).toEqual(expectedDefaultFilterValue)
    expect(mockZone.components['component1'].data.defaultFilter).toEqual(expectedDefaultFilterValue)
    expect(mockZone.components['component1'].data.subFilter).toEqual(undefined)
  })
})

describe ('Testing removeComponent function', () => {
  test('Removes component correctly', () => {
    const mockZone: Zone = {
      components: {
        'component1': {
          data: {
            id: 'component1',
            filter: {and_: {}}
          }
        },
        'component2': {
          data: {
            id: 'component2',
            filter: {and_: {}}
          }
        }
      },
      order: ['component1', 'component2'],
      type: 'dashboard'
    };

    removeComponent('component1', mockZone)
    expect(mockZone.components).not.toHaveProperty('component1')
    expect(mockZone.order).toEqual(['component2'])
  })
})

describe ('Testing addSubFilter function', () => {
  test('Adds subfilter correctly', () => {
    const mockZone: Zone = {
      components: {
        'component1': {
          data: {
            id: 'component1',
            filter: {and_: {}}
          }
        }
      },
      order: ['component1'],
      type: 'dashboard'
    };

    const filterValue: IFilter = {
      and_: {
        attribute1: {
          operator1: {
            value: 10,
            negate: false
          }
        }
      }
    }

    addSubFilter({id: 'component1', filter: filterValue, zone: mockZone})
    expect(mockZone.components['component1'].data.subFilter).toEqual(filterValue)
  })
})

describe ('Testing resetZone function', () => {
  test('Resets zone correctly', () => {
    const mockZone: Zone = {
      components: {
        'component1': {
          data: {
            id: 'component1',
            filter: {and_: {}}
          }
        }
      },
      order: ['component1'],
      type: 'dashboard'
    };

    const setZone = vitest.fn();

    // Call the function with the mock zone and setZone
    resetZone({ zone: mockZone, setZone });

    // Assert that setZone was called with the updated zone
    expect(setZone).toHaveBeenCalledWith({ ...mockZone });
  })
})

describe ('Testing setFilter function', () => {
  test('Sets filter correctly with valueExists and in_list', () => {

    const mockZone: Zone = {
      components: {
        'component1': {
          data: {
            id: 'component1',
            filter: {and_: {}}
          }
        }
      },
      order: ['component1'],
      type: 'dashboard'
    };

    const filterValue: IFilter = {
      and_: {
        attribute1: {
          in_list: {
            value: 10,
            negate: false
          }
        }
      }
    }

    setFilter({
      componentId: 'component1',
      value: 10,
      zone: mockZone,
      negate: false,
      attribute: 'attribute1',
      operator: 'in_list',
      valueExists: true
    });

    expect(mockZone.components['component1'].data.filter).toEqual(filterValue)
  })

  test('Sets filter correctly when value does not exist', () => {

    const mockZone: Zone = {
      components: {
        'component1': {
          data: {
            filter: {and_: {}}
          }
        }
      },
      order: ['component1'],
      type: 'dashboard'
    };

    setFilter({
      componentId: 'component1',
      value: 10,
      zone: mockZone,
      negate: false,
      attribute: 'attribute1',
      operator: 'test_operator',
      valueExists: false
    });

    expect(mockZone.components['component1'].data.filter).toEqual({and_: {}}) 
  })

  test('Sets filter correctly', () => {

    const mockZone: Zone = {
      components: {
        'component1': {
          data: {
            id: 'component1',
            filter: {and_: {}}
          }
        }
      },
      order: ['component1'],
      type: 'dashboard'
    };

    const filterValue2: IFilter = {
      and_: {
        attribute1: {
          test_operator: {
            value: 10,
            negate: false
          }
        }
      }
    }

    setFilter({
      componentId: 'component1',
      value: 10,
      zone: mockZone,
      negate: false,
      attribute: 'attribute1',
      operator: 'test_operator',
      valueExists: true
    });

    expect(mockZone.components['component1'].data.filter).toEqual(filterValue2)
  })

  test('Sets filter correctly with exists', () => {

    const mockZone: Zone = {
      components: {
        'component1': {
          data: {
            id: 'component1',
            filter: {and_: {}}
          }
        }
      },
      order: ['component1'],
      type: 'dashboard'
    };

    const filterValue: IFilter = {
      and_: {
        attribute1: {
          exists: {
            negate: false
          }
        }
      }
    }

    setFilter({
      componentId: 'component1',
      value: 10,
      zone: mockZone,
      negate: false,
      attribute: 'attribute1',
      operator: 'test_operator',
      exists: true
    });

    expect(mockZone.components['component1'].data.filter).toEqual(filterValue)
  })

  test('Removes empty filter', () => {

    const mockZone: Zone = {
      components: {
        'component1': {
          data: {
            id: 'component1',
            filter: {
              and_: {
                attribute1: {}
              }
            }
          }
        }
      },
      order: ['component1'],
      type: 'dashboard'
    };

    setFilter({
      componentId: 'component1',
      value: 10,
      zone: mockZone,
      negate: false,
      attribute: 'attribute1',
      operator: 'test_operator'
    });

    expect(mockZone.components['component1'].data.filter).toEqual({and_: {}})
  })

})

describe ('Testing filterListener function', () => {

  const TestComponent = (props) => {
    const [value, setValue] = useState(null);
    const [disabled, setDisabled] = useState(false);
    const [exists, setExists] = useState(true);
    const [negate, setNegate] = useState(true);

    filterListener({
      ...props,
      setValue,
      setDisabled,
      setExists,
      setNegate,
    }, [props.dependencies]);
  
    return (
      <div>
        <div data-testid="value">{value}</div>
        <div data-testid="disabled">{disabled.toString()}</div>
        <div data-testid="exists">{exists.toString()}</div>
        <div data-testid="negate">{negate.toString()}</div>
      </div>
    );
  };

  test('Calls filterListener correctly', () => {
    const mockZone: Zone = {
      components: {
        'component1': {
          data: {
            id: 'component1',
            filter: {and_: {
              attribute1: {
                exists: {
                  negate: true
                }
              }
            }}
          }
        }
      },
      order: ['component1'],
      type: 'dashboard'
    };

    const {rerender} = render(<TestComponent
      attribute="attribute1"
      componentId="component1"
      operators={['exists']}
      zone={mockZone}
      emptyValue={null}
      zoneToValue={(filterValue) => filterValue}
      dependencies={[mockZone]}
    />);

    expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    expect(screen.getByTestId('exists')).toHaveTextContent('true');
    expect(screen.getByTestId('negate')).toHaveTextContent('true');

    mockZone.components['component1'].data.filter = {and_: {}};
    
    act(() => {
      rerender(
        <TestComponent
          attribute="attribute1"
          componentId="component1"
          operators={['exists']}
          zone={mockZone}
          emptyValue={null}
          zoneToValue={(filterValue) => filterValue}
          dependencies={[mockZone]}
        />
      );
    });

    expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    expect(screen.getByTestId('exists')).toHaveTextContent('false');
    expect(screen.getByTestId('negate')).toHaveTextContent('false');

  })
})