// Import modules and functions
import React, { useState, useEffect } from "react";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "antd";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { Card } from "antd";
import axios from "axios";
import Kommunicate from "@kommunicate/kommunicate-chatbot-plugin";
import { KOMMUNICATE_APP_ID, KOMMUNICATE_LOADED } from "../config/kommunicate";

const { Meta } = Card;
// Restaurant List function
// elements from
// [1] Matheshyogeswaran, “Firebase Auth with react: Implement email/password
// and google sign-in,” Medium,
// https://blog.bitsrc.io/firebase-authentication-with-react-for-beginners-implementing-email-password-and-google-sign-in-e62d9094e22 (accessed Oct. 17, 2023).
function RestaurantList() {
  // navigate variable to use for BrowserRouter
  const navigate = useNavigate();

  // User Detail variable
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([
    {
      id: 1,
      restaurant_name: "Restaurant 1",
      images: [
        "https://sdp9restimages.s3.amazonaws.com/Effective-Strategies-To-Improve-Your-Restaurant-Service-And-Provide-A-Stellar-Guest-Experience.jpg",
      ],
    },
    {
      id: 2,
      restaurant_name: "Restaurant 2",
      images: [
        "https://sdp9restimages.s3.amazonaws.com/Effective-Strategies-To-Improve-Your-Restaurant-Service-And-Provide-A-Stellar-Guest-Experience.jpg",
      ],
    },
    {
      id: 3,
      restaurant_name: "Restaurant 3",
      images: [
        "https://sdp9restimages.s3.amazonaws.com/Effective-Strategies-To-Improve-Your-Restaurant-Service-And-Provide-A-Stellar-Guest-Experience.jpg",
      ],
    },
  ]);

  // Function called when page is loaded, kind of like main function or init function
  useEffect(() => {
    // Use Firebase to get the currently signed-in user
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, set the user state
        setUser(user);

        const isKommunicateLoaded = JSON.parse(
          sessionStorage.getItem(KOMMUNICATE_LOADED)
        );
        const Kommunicate_user_key = auth.currentUser.uid + "|" + auth.currentUser.email

        // Load Kommunicate iframe once
        if (!isKommunicateLoaded) {
          
          Kommunicate.init(KOMMUNICATE_APP_ID, {
            automaticChatOpenOnNavigation: true,
            popupWidget: true,
            userId: Kommunicate_user_key,
          });
          sessionStorage.setItem(KOMMUNICATE_LOADED, JSON.stringify(true));
        }
      } else {
                // No user is signed in
        setUser(null);

        //Clear Kommunicate local storage to prevent unauthorized access
        sessionStorage.removeItem(KOMMUNICATE_LOADED);

        //Redirect to login page
        navigate("/");

        //Force reload after log out to clear Kommunicate conversations
        window.location.reload();
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
     }, []);

  useEffect(() => {
    async function fetchRestuarants() {
      const headers = {
        "Content-type": "application/json",
      };
      const resData = await axios.get(
        "https://2iqvxzgo50.execute-api.us-east-1.amazonaws.com/dev/restaurants/list",
        { headers }
      );
      console.log("resdata is :", resData);
      const resJsonData = JSON.parse(resData.data.body);
      console.log("resParsedjson :", resJsonData);

      const userId = sessionStorage.getItem("userId");
      const restaurantDetails = resJsonData.filter(
        (item) => item.user_id === userId
      );

      console.log("restaurant details mapped to User: ", restaurantDetails);
      setRestaurants(restaurantDetails);

      const restaurantId = restaurantDetails[0].restaurant_id;
      sessionStorage.setItem(
        "restaurant_id",
        restaurantDetails[0].restaurant_id
      );
    }

    fetchRestuarants();
  }, []);

  const handleCreateRestaurant = async () => {
    navigate("/restaurant/create");
  };

  const handleViewRestaurant = async () => {
    navigate("/view-reservations");
  };

  const handleCreateReservation = async () => {
    navigate("/create-reservation");
  };

  // Sign Out function
  const handleSignOut = async () => {
    try {
      // Firebase inbuilt function
      await signOut(auth);

      // Redirect to the login page after signing out
      navigate("/");
    } catch (error) {
      // Log error
      console.error("Error signing out:", error);
      alert("Sign out error");
    }
  };
  const handleViewDetails = async (restaurant_id) => {
    navigate(`/restaurantpage/${restaurant_id}`);
  };
  // Frontend elements
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ float: "right", padding: "10px" }}>
        <Button icon={<LogoutOutlined />} onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h1>Restaurant List</h1>
          <Button type="primary" onClick={handleCreateRestaurant}>
            Create Restaurant
          </Button>
          <Button type="primary" onClick={handleViewRestaurant}>
            View Reservations
          </Button>
          <Button type="primary" onClick={handleCreateReservation}>
            Create Reservation
          </Button>
        </div>

        <div
          style={{ display: "flex", flexDirection: "row", overflowX: "auto" }}
        >
          <ul
            style={{
              display: "flex",
              listStyleType: "none",
              padding: 0,
              margin: 0,
              overflowX: "auto",
            }}
          >
            {restaurants.map((restaurant) => (
              <li
                key={restaurant.restaurant_id}
                style={{ marginRight: "10px" }}
              >
                <Card
                  style={{
                    width: 300,
                  }}
                  cover={<img alt="example" src={restaurant.images[0]} />}
                  actions={[
                    <Button
                      type="primary"
                      onClick={() =>
                        handleViewDetails(restaurant.restaurant_id)
                      }
                    >
                      View Details
                    </Button>,
                  ]}
                >
                  <Meta title={restaurant.restaurant_name} />
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RestaurantList;
