/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

// handleClickNewBill for container/Bills.js
describe("Given I am connected as Employee and I am on Bills page", () => {
  describe("When I click on the New Bill button", () => {
    test("Then, it should render NewBill page", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      const firestore = null;
      const allBills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const handleClickNewBill = jest.fn(allBills.handleClickNewBill);
      const billBtn = screen.getByTestId("btn-new-bill");

      billBtn.addEventListener("click", handleClickNewBill);
      fireEvent.click(billBtn);
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
  });
});

// handleClickIconEye for container/Bills.js
describe("Given I am connected as Employee and I am on Bills page", () => {
  describe("When I click on the icon eye", () => {
    test("A modal should open", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const html = BillsUI({
        data: bills,
      });
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname,
        });
      };

      const firestore = null;
      const allBills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      $.fn.modal = jest.fn();
      const eye = screen.getAllByTestId("icon-eye")[0];
      const handleClickIconEye = jest.fn(() =>
        allBills.handleClickIconEye(eye)
      );

      eye.addEventListener("click", handleClickIconEye);
      fireEvent.click(eye);
      expect(handleClickIconEye).toHaveBeenCalled();
      const modale = document.getElementById("modaleFile");
      expect(modale).toBeTruthy();
    });
  });
});
