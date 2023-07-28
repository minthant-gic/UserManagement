import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message } from "antd";
import styles from "../../styles/Usermanagement.module.css";
import Usermanagementtable from "./Usermanagementtable";
import { createUser, getUsers } from "../../api/api";
import { Messages } from "../../data/message";
import { Helmet } from "react-helmet";

const Usermanagement = ({ loginUser }) => {
  // useState to store user data fetched from the API
  const [userData, setUserData] = useState([]);
  // useState to handle loading state while API calls are in progress
  const [loading, setLoading] = useState(false);
  // Create a form instance using Form.useForm()
  const [form] = Form.useForm();
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // useState to keep track of the number of rows after filtering the user data
  const [filteredRowCount, setFilteredRowCount] = useState(0);

  // useEffect hook to fetch users when the component is mounted
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to fetch all users from the API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      setUserData(users);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  // useEffect hook to calculate the number of filtered rows whenever userData changes
  useEffect(() => {
    setFilteredRowCount(userData.filter((user) => user.del_flg === "0").length);
  }, [userData]);

  // Function to handle form submission for creating a new user
  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);
      const emailExists = userData.some((user) => user.email === values.email);

      // Check if the email already exists in the user data
      // Parameters: The input user data
      // Return: A message indicating that the email already exists
      if (emailExists) {
        // If the email exists, set an error message for the "email" form field
        form.setFields([
          {
            name: "email",
            errors: [Messages.M003],
          },
        ]);
        setLoading(false);
        return;
      }

      // Create a new user
      // Parameters: The input user data
      // Return: A message indicating success or failure
      const newUserData = {
        user_name: values.firstName,
        user_name_last: values.lastName,
        email: values.email,
        user_level: values.role,
        del_flg: "0",
        team_name: "",
        create_user: loginUser[0]._id,
        create_datetime: new Date().toISOString(),
      };

      // Use the API to create the new user
      await createUser(newUserData);
      message.success(Messages.M006);

      // Fetch the users again and reset the form fields
      fetchUsers();
      form.resetFields();
      window.location.reload();
    } catch (error) {
      message.success(Messages.M007);
      console.error("Error creating user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>User Management</title>
        <link rel="icon" type="image/png" href="/path/to/favicon.png" />
      </Helmet>
      <div className={styles["usermanagement-form-main"]}>
        <div className={styles["usermanagement-form-container"]}>
          <Form
            form={form}
            onFinish={handleFormSubmit}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Form.Item
              label="ユーザー名[姓]"
              name="firstName"
              rules={[{ required: true, message: Messages.M013 }]}
            >
              <Input className={styles["usermanagement-input"]} />
            </Form.Item>
            <Form.Item
              label="ユーザー名[名]"
              name="lastName"
              rules={[{ required: true, message: Messages.M014 }]}
            >
              <Input className={styles["usermanagement-input"]} />
            </Form.Item>
            <Form.Item
              label="メールアドレス"
              name="email"
              rules={[
                { required: true, message: Messages.M002 },
                { pattern: emailRegex, message: Messages.M004 },
              ]}
            >
              <Input className={styles["usermanagement-input"]} />
            </Form.Item>
            <Form.Item
              label="ユーザー権限"
              name="role"
              rules={[{ required: true, message: Messages.M005 }]}
            >
              <Select
                className={styles["usermanagement-input"]}
                options={[
                  {
                    value: "管理者",
                    label: "管理者",
                  },
                  {
                    value: "スーパー管理者",
                    label: "スーパー管理者",
                  },
                  {
                    value: "メンバー",
                    label: "メンバー",
                  },
                ]}
              />
            </Form.Item>
            <Form.Item
              className={styles["usermanagement-form-button-container"]}
            >
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className={styles["usermanagement-table-main"]}>
          <Usermanagementtable
            data={userData}
            loading={loading}
            fetchUsers={fetchUsers}
            loginUserid={loginUser[0]._id}
          />
        </div>
      </div>
    </>
  );
};

export default Usermanagement;
