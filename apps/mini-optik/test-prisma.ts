
function decrypt(text) { return 'decrypted_' + text; }
function decryptCustomerInPlace(customer) {
  if (!customer || typeof customer !== 'object') return;
  const fieldsToDecrypt = ['firstName', 'lastName', 'phone', 'tcNo', 'address', 'email', 'diseases', 'notes'];
  for (const field of fieldsToDecrypt) {
    if (customer[field] && typeof customer[field] === 'string' && customer[field].includes(':')) {
       customer[field] = decrypt(customer[field]) ?? customer[field];
    }
  }
}

function deeplyDecryptCustomersInPlace(data) {
  if (!data) return data;
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      deeplyDecryptCustomersInPlace(data[i]);
    }
    return data;
  }
  if (data instanceof Date || Buffer.isBuffer(data)) return data;

  if (typeof data === 'object') {
    if (('firstName' in data) || ('lastName' in data) || ('phone' in data)) {
      decryptCustomerInPlace(data);
    }
    for (const key in data) {
      const val = data[key];
      if (val !== null && typeof val === 'object' && !(val instanceof Date) && !Buffer.isBuffer(val)) {
        deeplyDecryptCustomersInPlace(val);
      }
    }
    return data;
  }
  return data;
}

const mock = {
  orders: [
    { id: 1, createdAt: new Date(), customer: { firstName: 'a:b:c', lastName: 'd:e:f' } },
    { id: 2, something: { nested: { phone: '1:2:3' } } }
  ]
};

console.log(JSON.stringify(deeplyDecryptCustomersInPlace(mock), null, 2));

