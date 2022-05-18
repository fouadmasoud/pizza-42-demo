import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Alert,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
  Spinner
} from "reactstrap";
import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";

export const ExternalApiComponent = () => {
  const { apiOrigin = window.location.origin } = getConfig();
  const { user } = useAuth0();

  const [state, setState] = useState({
    showResult: false,
    createOrderMessage: "",
    orderHistory: "",
    isPlacingOrder: false,
    error: null,
  });

  const dropdownDefaultValue = "Select a Pizza";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState(dropdownDefaultValue);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const select = (event) => {
    setDropdownValue(event.target.innerText);
    setDropdownOpen(!dropdownOpen);
  };

  const { getAccessTokenSilently, loginWithPopup, getAccessTokenWithPopup } =
    useAuth0();

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await orderPizza();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await orderPizza();
  };

  const orderPizza = async () => {
    setState({
      ...state,
      showResult: false,
      createOrderMessage: "",
      orderHistory: "",
      isPlacingOrder: true,
    });

    try {
      const token = await getAccessTokenSilently();
      const timeElapsed = Date.now();
      const today = new Date(timeElapsed);

      const data = {
        user_id: user.sub,
        item_ordered: dropdownValue,
        order_date: today.toISOString(),
      };

      const responseData = await axios({
        method: "post",
        url: `${apiOrigin}/api/order`,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const orderHistory = await getOrderHistory();
      setState({
        ...state,
        showResult: true,
        createOrderMessage: responseData.data.msg,
        orderHistory: orderHistory,
        isPlacingOrder: false,
      });
    } catch (error) {
      console.log("Order Pizza Failed", error.innerText);
      setState({
        ...state,
        error: error.error,
      });
    }
  };

  const getOrderHistory = async () => {
    try {
      const token = await getAccessTokenSilently();
      const params = {
        user_id: user.sub,
      };

      const responseData = await axios({
        method: "get",
        url: `${apiOrigin}/api/order`,
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return responseData.data;
    } catch (error) {
      console.log("Get Order History Failed", error.innerText);
      setState({
        ...state,
        error: error.error,
      });
    }
  };
  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const { isPlacingOrder } = state;

  return (
    <>
      <div className="mb-5">
        {state.error === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}

        {state.error === "login_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleLoginAgain)}
            >
              log in again
            </a>
          </Alert>
        )}

        <h1>Amazing Pizza Is Almost Yours</h1>
        {user.email_verified && (
          <div>
            <p className="lead">Select one of our delicious pizzas to order</p>

            <Dropdown isOpen={dropdownOpen} toggle={toggle}>
              <DropdownToggle caret>{dropdownValue}</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={select}>cheese pizza - $20</DropdownItem>
                <DropdownItem onClick={select}>
                  pepperoni pizza - $25
                </DropdownItem>
                <DropdownItem onClick={select}>
                  veggie pizza - $28{" "}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              variant="primary"
              color="primary"
              className="mt-5"
              onClick={orderPizza}
              disabled={dropdownValue === dropdownDefaultValue}
            >
              {isPlacingOrder ? (
                <Spinner
                  as="span"
                  animation="grow"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Give Me Pizza!"
              )}
            </Button>
          </div>
        )}

        {!user.email_verified && (
          <Alert color="warning">
            <p>You can't order any pizza until you've verified your email.</p>
          </Alert>
        )}
      </div>

      <div className="result-block-container">
        {state.showResult && (
          <div className="result-block" data-testid="api-result">
            <h6 className="muted">Result</h6>
            <Highlight>
              <span>{JSON.stringify(state.createOrderMessage, null, 2)}</span>
            </Highlight>
            <Highlight>
              <span>{JSON.stringify(state.orderHistory, null, 2)}</span>
            </Highlight>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuthenticationRequired(ExternalApiComponent, {
  onRedirecting: () => <Loading />,
});
