const soap = require('soap');
const http = require('http');

// Создаем SOAP-сервер
const service = {
  getValutes: async function(args, callback) {
    // Отправляем запрос на сервер ЦБ РФ
    const client = await soap.createClientAsync('https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx?WSDL');
    const result = await client.GetCursOnDateXMLAsync({ On_date: new Date() });
    const valutes = await client.EnumValutesXMLAsync({ Seld: false });
    callback(null, { valutes: result[0].GetCursOnDateXMLResult.ValuteCursOnDate[0].ValuteCurs });
  },
  getValute: async function(args, callback) {
    // Отправляем запрос на сервер ЦБ РФ
    const client = await soap.createClientAsync('https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx?WSDL');
    const result = await client.GetCursDynamicXMLAsync({
      FromDate: args.FromDate,
      ToDate: args.ToDate,
      ValutaCode: args.ValutaCode
    });
    callback(null, { valute: result[0].GetCursDynamicXMLResult.ValuteCursDynamic[0].ValuteCurs });
  }
};

// Определение сервиса
const xml = `
  <definitions name="ProxyService"
               targetNamespace="http://example.com/ProxyService"
               xmlns:tns="http://example.com/ProxyService"
               xmlns:xsd1="http://example.com/ProxyService/xsd"
               xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
               xmlns="http://schemas.xmlsoap.org/wsdl/">
    <service name="ProxyService">
      <port name="ProxyPort" binding="tns:ProxyBinding">
        <soap:address location="http://localhost:8000/proxy"/>
      </port>
    </service>
    <portType name="ProxyPortType">
      <operation name="getValutes">
        <soap:operation soapAction="getValutes"/>
        <input message="tns:getValutesRequest"/>
        <output message="tns:getValutesResponse"/>
      </operation>
      <operation name="getValute">
        <soap:operation soapAction="getValute"/>
        <input message="tns:getValuteRequest"/>
        <output message="tns:getValuteResponse"/>
      </operation>
    </portType>
    <message name="getValutesRequest"/>
    <message name="getValutesResponse">
      <part name="valutes" element="xsd1:valutes"/>
    </message>
    <message name="getValuteRequest">
      <part name="FromDate" element="xsd:string"/>
      <part name="ToDate" element="xsd:string"/>
      <part name="ValutaCode" element="xsd:string"/>
    </message>
    <message name="getValuteResponse">
      <part name="valute" element="xsd1:valute"/>
    </message>
  </definitions>
`;

// Запускаем сервер
const server = http.createServer((req, res) => {
  if (req.url === '/proxy?wsdl') {
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(xml);
  } else {
    soap.listen(server, '/proxy', service, xml, (err, wsdl) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Сервер запущен на порту 8000');
      }
    });
  }
});

server.listen(8000, () => {
  console.log('Сервер запущен на порту 8000');
});