import { screen, fireEvent, waitFor } from "@testing-library/dom";

import { localStorageMock } from "../__mocks__/localStorage.js";

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { bills } from "../fixtures/bills.js";

// import store from "../app/Store.js";

import { ROUTES_PATH } from "../constants/routes";
import Router from "../app/Router";
import userEvent from "@testing-library/user-event";

// Mock - parameters for bdd Firebase & data fetching
const store = jest.mock("../app/Store");

// LocalStorage - Employee
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});
window.localStorage.setItem(
  "user",
  JSON.stringify({
    type: "Employee",
  })
);

// Init newBill
const newBill = {
  id: "QcCK3SzECmaZAGRrHjaC",
  status: "refused",
  pct: 20,
  amount: 200,
  email: "a@a",
  name: "newBill",
  vat: "40",
  fileName: "preview-facture-free-201801-pdf-1.jpg",
  date: "2002-02-02",
  commentAdmin: "pas la bonne facture",
  commentary: "test2",
  type: "Restaurants et bars",
  fileUrl:
    "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732",
};

// Init onNavigate
const onNavigate = (pathname) => {
  document.body.innerHTML = pathname;
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then letter icon in vertical layout should be highlighted", () => {
      // Routing variable
      const pathname = ROUTES_PATH["NewBill"];

      // Mock - parameters for bdd Firebase & data fetching
      store.bills = () => ({
        bills,
        get: jest.fn().mockResolvedValue(),
      });

      // build div DOM
      Object.defineProperty(window, "location", {
        value: {
          hash: pathname,
        },
      });
      document.body.innerHTML = `<div id='root'></div>`;

      // Router init to get actives CSS classes
      Router();
      expect(screen.getByTestId("icon-mail")).toBeTruthy();
      expect(
        screen.getByTestId("icon-mail").classList.contains("active-icon")
      ).toBeTruthy();
    });
  });
  test("Then, NewBill page should be rendered", () => {
    document.body.innerHTML = NewBillUI();
    const newBillContainer = screen.findByText(
      'class="form-newbill-container"'
    );
    const expenseType = screen.getByTestId("expense-type");
    const expenseName = screen.getByTestId("expense-name");
    const amount = screen.getByTestId("amount");
    const vat = screen.getByTestId("vat");
    const pct = screen.getByTestId("pct");
    const commentary = screen.getByTestId("commentary");
    const file = screen.getByTestId("file");

    expect(newBillContainer).toBeTruthy();
    expect(expenseType).toBeTruthy();
    expect(expenseName).toBeTruthy();
    expect(amount).toBeTruthy();
    expect(vat).toBeTruthy();
    expect(pct).toBeTruthy();
    expect(commentary).toBeTruthy();
    expect(file).toBeTruthy();
  });
  describe("When I click on send button", () => {
    test("Then, It should submit form", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = NewBillUI();

      const sendButton = screen.getByText("Envoyer");

      const handleSubmit1 = jest.fn((e) => newBill.handleSubmit);
      sendButton.addEventListener("click", handleSubmit1);
      fireEvent.click(sendButton);
      expect(handleSubmit1).toHaveBeenCalled();
    });
  });
  describe("When I add a file", () => {
    test("Then, the file name should be rendered into the input", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = NewBillUI();

      const inputEl = document.getElementById("file_upload");

      const file = new File(["hello"], "hello.png", { type: "image/png" });

      userEvent.upload(inputEl, file);
      expect(inputEl.files[0]).toStrictEqual(file);
      expect(inputEl.files.item(0)).toStrictEqual(file);
      expect(inputEl.files).toHaveLength(1);

      const sendButton = document.getElementById("btn-send-bill");
      const handleChangeFile1 = jest.fn((e) => newBill.handleChangeFile);
      sendButton.addEventListener("click", handleChangeFile1);
      fireEvent.click(sendButton);
      expect(handleChangeFile1).toHaveBeenCalled();
    });
  });
});
