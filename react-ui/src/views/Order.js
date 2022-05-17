import React, { useState } from "react";
import axios from 'axios';
import {
  Button,
  Alert,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
} from "reactstrap";
import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";

export const ExternalApiComponent = () => {
  const { apiOrigin = window.location.origin, audience } = getConfig();
  const { user } = useAuth0();

  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState('Give Me Pizza');

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

    await callApi();
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

    await callApi();
  };

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();

      // const response = await fetch(`${apiOrigin}/api/order`, {
      //   method: 'POST',
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({item: dropdownValue})
      // });
      // const responseData = await response.json();

      

        const responseData = await axios({
          method: 'post',
          url: `${apiOrigin}/api/order`,
          data: {
            item: dropdownValue
          },
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
           }
        });


      setState({
        ...state,
        showResult: true,
        apiMessage: responseData,
      });
    } catch (error) {
      console.log("Order call failed", error);
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

        <h1>Order Pizza</h1>
        {user.email_verified && (
          <div>
            <p className="lead">Select one of our delicious pizzas to order</p>

            <Dropdown isOpen={dropdownOpen} toggle={toggle}>
              <DropdownToggle caret>{dropdownValue}</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={select}>cheese pizza - $20</DropdownItem>
                <DropdownItem onClick={select}>pepperoni pizza - $25</DropdownItem>
                <DropdownItem onClick={select}>veggie pizza - $28 </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              color="primary"
              className="mt-5"
              onClick={callApi}
              disabled={!audience}
            >
              Order Pizza
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
              <span>{JSON.stringify(state.apiMessage, null, 2)}</span>
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
