import { NtlmClient } from "axios-ntlm";

// ✅ NTLM credentials (store in .env instead of hardcoding)
const credentials = {
  username:  "arun.singh",
  password:  "DAxC87$'bK0v",
  domain:  "" 
};

// ✅ Base URL for Business Central OData
const BASE_URL =
  "http://20.198.227.247:7048/BC240/ODataV4/Company('CRONUS%20India%20Ltd.')";

// ✅ Create NTLM client
function createClient() {
  return NtlmClient(credentials, {
    baseURL: BASE_URL,
    method: "get"
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
