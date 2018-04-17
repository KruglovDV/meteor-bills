import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Form, Grid, Segment } from 'semantic-ui-react'
import { Payments } from '../api/payments';
import DataTable from './Table';
import _ from 'lodash';

class App extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();

    const textArea = e.target.apns;
    const text = textArea.value;

    const apnsArr = text
      .replace(/\-/g, '')
      .replace(/\s+/g, ',')
      .replace(/\,+/g, '|')
      .split('|')
      .filter(el => el !== '');

    Meteor.call('addAPN', apnsArr);

    textArea.value = '';
  }
  render() {
    const payments = _.uniqBy(this.props.payments, 'Apn');
    return (
      <div className="home-page">
        <Segment>
          <Form onSubmit={this.handleSubmit}>
            <Form.TextArea name="apns" placeholder="insert APN..."/>
            <Form.Button>Submit</Form.Button>
          </Form>
        </Segment>
        <div className="home-page__table">
          <DataTable data={payments} />
        </div>
      </div>);
  }
}

export default withTracker(() => {
  Meteor.subscribe('payments');

  return {
    payments: Payments.find({}).fetch(),
  };
})(App);