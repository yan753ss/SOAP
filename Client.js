const soap = require('soap');

// Функция создания клиента и вызова методов на сервере
async function createClient() {
  // Создаем клиента для взаимодействия с сервером
  const url = 'http://localhost:8000/proxy?wsdl';
  const client = await soap.createClientAsync(url);

  // Вызываем метод getValutes на сервере
  client.getValutes({}, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });

  // Вызываем метод getValute на сервере
  client.getValute({ FromDate: '2022-01-01', ToDate: '2022-01-31', ValutaCode: 'USD' }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
}

// Вызываем функцию создания клиента
createClient();