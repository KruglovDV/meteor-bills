import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import rp from 'request-promise';
import config from '../../config';

export const Payments = new Meteor.Collection('payments');

const maxRequest = 2;

const getBills = async apn => {
  const res = await rp({ uri: `${config.billSummaryApi}?parcel=${apn}`, json: true });

  const bills = await Promise.all(res.Bills.map(bill => {
    const { RollDate, BillNumber, BillAmount } = bill;
    return rp({ uri: `${config.billDetail}?rollYear=${RollDate}&billNumber=${BillNumber}`, json: true })
      .then(details => ({ BillAmount, ...details }));
  }));

  return bills.map(bill =>
    ({ data: {
      Apn: apn,
      IsDelinquent: bill.GlobalData.IsDelinquent,
      BillAmount: bill.BillAmount,
      ...bill.Bill 
    } }));
};

const prepareAndSaveData = arr => {
  const flatten = arr.reduce((acc, bills) => [...acc, ...bills], []);

  const prepared = flatten.map(bill => {
    const { Apn, BillNumber, BillType, BillAmount, Installments, IsDelinquent } = bill.data;
    return { Apn, BillNumber, BillType, BillAmount,
      FirstInstallment: Installments[0], SecondInstallment: Installments[1], IsDelinquent };
  });

  prepared.forEach(el => {
    Payments.insert(el);
  });
};

const getData = async (arr, acc = []) => {
  if (!arr.length) {
    return prepareAndSaveData(acc);
  }
  const current = arr.slice(0, maxRequest);
  const nextStep = arr.slice(maxRequest);
  const data = await Promise.all(current.map(apn => getBills(apn)));

  getData(nextStep, [...acc, ...data]);
}

if (Meteor.isServer) {
  Meteor.publish('payments', function() {
    return Payments.find({}, {'_id': false});
  });
}

Meteor.methods({
  addAPN(apns) {
    Payments.remove({});
    getData(apns);
  }
});