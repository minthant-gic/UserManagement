import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Messages } from "../../data/message";
import styles from "../../styles/Login.module.css";
import { getUsers } from "../../api/api";
import { Helmet } from "react-helmet";

const Login = ({ onLogin, setLoginUsercheck }) => {
  // State variable to manage user data
  const [userData, setUserData] = useState([]);
  // State variables for username and password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // State variable for login message
  const [message, setMessage] = useState("");

  // Fetch user data when the component is mounted
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to fetch all users
  const fetchUsers = async () => {
    try {
      const users = await getUsers();
      setUserData(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Filter data to get only users that are not deleted
  const filteredData = userData?.filter((user) => user.del_flg === "0");

  // Filter data to get only specific user levels
  const users = filteredData?.filter(
    (user) =>
      user.user_level === "admin" ||
      user.user_level === "super admin" ||
      user.user_level === "member"
  );

  // Use react-router's useNavigate hook for screen navigation
  const navigate = useNavigate();

  // Handler function when the login form is submitted
  const handleSubmit = (values) => {
    const { username } = values;

    // Find the user from the filtered user data based on the username
    const user = users.find((user) => {
      const fullName = `${user.user_name} ${user.user_name_last}`;
      return fullName === username;
    });

    // If the user exists and is an admin or super admin
    if (
      user &&
      (user.user_level === "admin" || user.user_level === "super admin")
    ) {
      setLoginUsercheck(true);
    } else {
      setLoginUsercheck(false);
    }

    // If the user exists and is an admin, super admin, or member
    if (
      user &&
      (user.user_level === "admin" ||
        user.user_level === "super admin" ||
        user.user_level === "member")
    ) {
      setMessage("ログイン成功");

      // Clear the input fields
      setUsername("");
      setPassword("");
      onLogin(
        user.email,
        user._id,
        user.user_level,
        user.user_name,
        user.user_name_last,
        user.team_name
      );
      navigate("/menu");
    } else {
      setMessage("ユーザー名とパスワードが間違っています。");
    }
  };

  return (
    <>
      <Helmet>
        <title>User Management</title>
        <link rel="icon" type="image/png" href="/path/to/favicon.png" />
      </Helmet>
      <div className={styles["login-form-main"]}>
        <div className={styles["login-form-container"]}>
          <Form
            initialValues={{
              remember: true,
            }}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: Messages.M018,
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="ユーザー名"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: Messages.M019,
                },
              ]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="パスワード"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles["login-form-button"]}
              >
                ログイン
              </Button>
            </Form.Item>
            <p className={styles["login-form-err-message"]}>{message}</p>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Login;
