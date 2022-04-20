/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI";
import BillsUI, { rows } from "../views/BillsUI";
import { bills } from "../fixtures/bills";
import NewBill from "../containers/NewBill";
import Bills from "../containers/Bills";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("And I submit the form with valid data", () => {
    test("Then my bill should be created", () => {
      document.body.innerHTML = NewBillUI();
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "johndoe@email.com",
        })
      );
      const newBill = new NewBill({
        document,
        onNavigate: () => {},
        store: null,
        localStorage: window.localStorage,
      });
      newBill.handleSubmit = jest.fn();
      const validBill = {
        type: "Equipement et matériel",
        name: "Souris Logitech",
        date: "2021-09-17",
        amount: 1,
        vat: 70,
        pct: 20,
        commentary: "Remplacement",
        fileUrl: "https://fisheye-six.vercel.app/assets/logo.png",
        fileName: "logo.png",
      };
      screen.getByTestId("expense-type").value = validBill.type;
      screen.getByTestId("expense-name").value = validBill.name;
      screen.getByTestId("datepicker").value = validBill.date;
      screen.getByTestId("amount").value = validBill.amount;
      screen.getByTestId("vat").value = validBill.vat;
      screen.getByTestId("pct").value = validBill.pct;
      screen.getByTestId("commentary").value = validBill.commentary;
      newBill.fileName = validBill.fileName;
      newBill.fileUrl = validBill.fileUrl;

      const onSubmit = jest.fn((e) => newBill.handleSubmit(e));
      const button = screen.getByTestId("btn-send-bill");
      button.addEventListener("click", onSubmit);

      userEvent.click(button);

      expect(onSubmit).toHaveBeenCalled();
      expect(newBill.handleSubmit).toHaveBeenCalled();
    });
  });

  describe("When I add a file other than an image (jpg, jpeg or png)", () => {
    test("Then, the bill shouldn't be created and I stay on the NewBill page", () => {
      document.body.innerHTML = NewBillUI();
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "johndoe@email.com",
        })
      );
      const newBill = new NewBill({
        document,
        onNavigate: () => {},
        store: null,
        localStorage: window.localStorage,
      });

      // mock of handleSubmit
      const handleSubmit = jest.fn(newBill.handleSubmit);

      newBill.fileName = "invalid";

      // EventListener to submit the form
      const submitBtn = screen.getByTestId("form-new-bill");
      submitBtn.addEventListener("submit", handleSubmit);
      fireEvent.submit(submitBtn);

      // handleSubmit function must be called
      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });

    test("Then the error message should be display", async () => {
      document.body.innerHTML = NewBillUI();
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "johndoe@email.com",
        })
      );
      // Init newBill
      const newBill = new NewBill({
        document,
        onNavigate: () => {},
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Mock of handleChangeFile
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);

      // Add Event and fire
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["image.exe"], "image.exe", {
              type: "image/exe",
            }),
          ],
        },
      });

      // handleChangeFile function must be called
      expect(handleChangeFile).toBeCalled();
      // The name of the file should be 'image.exe'
      expect(inputFile.files[0].name).toBe("image.exe");
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  // test d'intégration POST
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "johndoe@email.com",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByTestId("error-message");
      expect(message).toBeTruthy();
    });
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
        const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
