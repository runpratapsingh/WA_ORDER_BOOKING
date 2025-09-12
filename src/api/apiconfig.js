
import { NtlmClient } from "axios-ntlm";

// 🔹 OData API credentials
const CUSTOMERLIST_ODATA_URL =
  "http://20.198.227.247:7048/BC240/ODataV4/Company('CRONUS%20India%20Ltd.')/CustomerList";

const NTLM_CONFIG = {
  username: "arun.singh",
  password: "DAxC87$'bK0v",
  domain: "",      // leave empty if not needed
};

// ✅ Fetch Customer List from OData
export async function fetchCustomers() {
  try {
    const client = NtlmClient(NTLM_CONFIG, {
      baseURL: "http://20.198.227.247:7048",
      method: "get",
    });

    const resp = await client.get(
      `/BC240/ODataV4/Company('CRONUS%20India%20Ltd.')/CustomerList`
    );

    const customerData = resp.data.value || [];

    return customerData.slice(0, 10).map((c, index) => ({
      id: `customer_${index + 1}`,
      title: c.Name || "Unknown Customer",
      description: c.Contact || c.Location_Code || "No details",
    }));
  } catch (err) {
    console.error("❌ Error fetching customers:", err.message);
    return [];
  }
}