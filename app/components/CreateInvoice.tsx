export function CreateInvoice({
  firstName,
  lastName,
  address,
  email,
}: {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
}) {
  return (
    <div>
      <h1>Create Invoice</h1>
      <form>
        <label>First Name</label>
        <input type="text" value={firstName} />
        <label>Last Name</label>
        <input type="text" value={lastName} />
        <label>Address</label>
        <input type="text" value={address} />
        <label>Email</label>
        <input type="text" value={email} />
        <button type="submit">Create Invoice</button>
      </form>
    </div>
  );
}
