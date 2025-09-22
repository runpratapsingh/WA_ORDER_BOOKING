import { NtlmClient } from "axios-ntlm";
import axios from "axios";
import { parseStringPromise } from "xml2js";

// ✅ NTLM credentials (store in .env instead of hardcoding)
const credentials = {
  username: "arun.singh",
  password: "DAxC87$'bK0v",
};

// ✅ Base URL for Business Central OData
const BASE_URL =
  "http://20.198.227.247:7048/BC240/ODataV4/Company('CRONUS%20India%20Ltd.')";

// ✅ Create NTLM client
function createClient() {
  return NtlmClient(credentials, {
    baseURL: BASE_URL,
    method: "get",
  });
}

// ✅ Fetch Customer List
export async function fetchCustomers() {
  try {
    const client = createClient();
    const resp = await client.get("/CustomerList");
    return resp.data.value || [];
  } catch (err) {
    console.error("❌ Error fetching customers:", err.message);
    return [];
  }
}

// ✅ Fetch Sales Orders
export async function fetchSalesOrders() {
  try {
    const client = createClient();
    const resp = await client.get("/SalesOrder");
    return resp.data.value || [];
  } catch (err) {
    console.error("❌ Error fetching sales orders:", err.message);
    return [];
  }
}

// ✅ Fetch Sales Persons
export async function fetchSalesPersons() {
  try {
    const client = createClient();
    const resp = await client.get("/SalesPerson");
    return resp.data.value || [];
  } catch (err) {
    console.error("❌ Error fetching sales persons:", err.message);
    return [];
  }
}

// ✅ Fetch Items
export async function fetchItems() {
  try {
    const client = createClient();
    const resp = await client.get("/Items");
    return resp.data.value || [];
  } catch (err) {
    console.error("❌ Error fetching items:", err.message);
    return [];
  }
}

// ✅ SOAP API base URL
const SOAP_URL =
  "http://20.198.227.247:7047/BC240/WS/CRONUS%20India%20Ltd./Codeunit/MobAuthenication";

// ✅ Call SOAP API with NTLM auth
export async function callSoapAPI(phone) {
  try {
    const client = NtlmClient(credentials, {
      baseURL: SOAP_URL,
      method: "post",
    });

    // SOAP XML request
    const xml = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <CheckMobileNumber xmlns="urn:microsoft-dynamics-schemas/codeunit/MobAuthenication">
            <mobNo>${phone}</mobNo>
          </CheckMobileNumber>
        </soap:Body>
      </soap:Envelope>
    `;

    const response = await client.post("", xml, {
      headers: {
        "Content-Type": "text/xml;charset=utf-8",
        SOAPAction: "urn:microsoft-dynamics-schemas/codeunit/MobAuthenication",
      },
    });

    console.log("✅ SOAP XML Response:");
    console.log(response.data);

    // Convert XML to JSON
    const jsonResult = await parseStringPromise(response.data, {
      explicitArray: false,
      ignoreAttrs: true,
    });

    console.log("✅ Converted JSON Response:");
    console.log(JSON.stringify(jsonResult, null, 2));

    // 👉 Optional: return only useful part (without SOAP envelope)
    const cleanResult =
      jsonResult["s:Envelope"]?.["s:Body"]?.["CheckMobileNumber_Result"] || {};
    const returnValue =
      jsonResult["Soap:Envelope"]["Soap:Body"]["CheckMobileNumber_Result"][
        "return_value"
      ];

    console.log("📌 Return Value:", returnValue);
    return returnValue;
  } catch (error) {
    console.error("❌ Error calling SOAP API:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
    return null;
  }
}
