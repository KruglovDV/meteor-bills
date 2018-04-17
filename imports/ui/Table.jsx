import React from 'react';
import { Table } from 'semantic-ui-react';

export default class DataTable extends React.Component {

  getFlattenObject = (nestedObj, parent = '') => (
    Object.keys(nestedObj).reduce((acc, key) => {
      const newKey = parent ? `${parent}.${key}` : key;
      if (typeof nestedObj[key] === 'object') {
        return { ...acc, ...this.getFlattenObject(nestedObj[key], newKey)};
      }
      return { ...acc, [newKey]: nestedObj[key] };
    }, {})
  );

  renderTHead = (obj) => {
    return (
      <Table.Row>
        {
          Object.keys(obj).reduce((acc, key) => {
          if (key === '_id' || key === 'IsDelinquent') {
            return acc;
          }
          return [...acc, <Table.HeaderCell>{key}</Table.HeaderCell>];
          }, [])
        }
      </Table.Row>);
  }

  renderRow = (obj) => {
    return (
      <Table.Row warning={obj.IsDelinquent}>
        {
          Object.keys(obj).reduce((acc, key) => {
            if (key === '_id' || key === 'IsDelinquent') {
              return acc;
            }
            return [...acc, <Table.Cell>{obj[key]}</Table.Cell>];
            }, [])
        }
      </Table.Row>);
  }

  renderTBody = (data) => {
    return data.map(row => this.renderRow(row));
  }

  render() {
    const { data } = this.props;
    const flattenData = data.map(el => this.getFlattenObject(el));

    if (!data.length) {
      return <div></div>;
    }

    return (
      <div>
        <Table>
          <Table.Header>
            {this.renderTHead(flattenData[0])}
          </Table.Header>
          <tbody>
            {this.renderTBody(flattenData)}
          </tbody>
        </Table>
      </div>);
  }
}