import { DATABASE_TABLE, init } from "./database";

const db = await init();

const [{ columns, values }] = db.exec(`SELECT * FROM ${DATABASE_TABLE}`);

document.getElementById("app").innerHTML = `<table>
    <thead>
      <tr>${columns.map((col) => `<th scope="col">${col}</th>`)}</tr>
    </thead>
    <tbody>
      ${values.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`)}</tr>`)}
    </tbody>
  </table>`;
