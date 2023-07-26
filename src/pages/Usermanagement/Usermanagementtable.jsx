import React, { useState, useRef, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  message,
  Form,
  Input,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { deleteUser, updateUser } from "../../api/api";
import { Messages } from "../../data/message";
import Highlighter from "react-highlight-words";
import styles from "../../styles/Usermanagementtable.module.css";
import { Helmet } from "react-helmet";

const Usermanagementtable = ({ data, loading, fetchUsers, loginUserid }) => {
  // State variables definition

  // Controls the visibility of the delete confirmation modal
  const [deleteModalShow, setDeleteModalShow] = useState(false);

  // Controls the visibility of the edit user modal
  const [editModalShow, setEditModalShow] = useState(false);

  // Holds the details of the selected user to edit
  const [selectedUser, setselectedUser] = useState("");

  // Holds the ID of the selected user to edit or delete
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Form instance for user data editing
  const [form] = Form.useForm();

  // Holds the text for search filtering
  const [searchText, setSearchText] = useState("");

  // Indicates the column being searched for filtering
  const [searchedColumn, setSearchedColumn] = useState("");

  // Ref to the search input field
  const searchInput = useRef(null);

  // Regular expression to validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Indicates whether the search resulted in empty data
  const [emptySearchResults, setEmptySearchResults] = useState(false);

  // Tracks the current page number for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Indicates if a search is active or not
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Holds the filtered data based on search
  const [searchedData, setSearchedData] = useState(data);

  // Counts the initial number of undeleted users
  let initialUndeletedUsersCount = 0;
  if (data) {
    initialUndeletedUsersCount = data.filter(
      (user) => user.del_flg === "0"
    ).length;
  }

  // Holds the total number of filtered rows after search
  const [totalFilteredRows, setTotalFilteredRows] = useState(
    initialUndeletedUsersCount
  );

  // Perform search when the "Search" button is clicked or "Enter" is pressed
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();

    const searchTerm =
      selectedKeys[0] && typeof selectedKeys[0] === "string"
        ? selectedKeys[0].toLowerCase()
        : "";

    setSearchText(searchTerm);
    setSearchedColumn(dataIndex);

    const filteredData = data.filter((record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(searchTerm)
        : ""
    );

    if (filteredData.length === 0) {
      message.warning(Messages.M021);
    }

    setSearchedData(filteredData);
    setIsSearchActive(true);

    // Assuming that 'del_flg' property is a string
    const totalFilteredRows = filteredData.filter(
      (user) => user.del_flg === "0"
    ).length;
    setTotalFilteredRows(totalFilteredRows);
  };

  // Reset the search field and clear any applied filters when the "Cancel" button is pressed
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
    setIsSearchActive(false);
    setSearchedData(data);
    setTotalFilteredRows(initialUndeletedUsersCount);
  };

  // Set properties for the search field
  const getColumnSearchProps = (dataIndex, placeholder) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={placeholder}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            検索
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            キャンセル
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  // Edit user data
  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
      const userData = {
        user_name: values.firstName,
        user_name_last: values.lastName,
        email: values.email,
        user_level: values.role,
        del_flg: "0",
        create_user: selectedUser.create_user,
        create_datetime: selectedUser.create_datetime,
        update_user: loginUserid,
        update_datetime: new Date().toISOString(),
      };
      await updateUser(selectedUserId, userData);
      message.success(Messages.M008);
      handleModalCancel();
      fetchUsers();
    } catch (error) {
      message.error(Messages.M009);
      console.error("Error updating user:", error);
    }
  };

  // Open the modal for editing a user's data
  const handleEditUser = async (userId) => {
    form.resetFields();
    try {
      const user = await data.find((user) => user._id === userId);
      setselectedUser(user);
      form.setFieldsValue({
        firstName: user.user_name,
        lastName: user.user_name_last,
        email: user.email,
        role: user.user_level,
      });
    } catch (error) {
      console.log(error);
    }
    setEditModalShow(true);
  };

  // Delete a user
  const handleDelete = async (userId) => {
    try {
      const selectedUser = data.find((user) => user._id === userId);
      form.resetFields();
      if (selectedUser) {
        const userData = {
          user_name: selectedUser.user_name,
          user_name_last: selectedUser.user_name_last,
          email: selectedUser.email,
          user_level: selectedUser.user_level,
          del_flg: "1",
          create_user: selectedUser.create_user,
          create_datetime: selectedUser.create_datetime,
          update_user: loginUserid,
          update_datetime: new Date().toISOString(),
        };
        await deleteUser(selectedUserId, userData);
      }
      message.success(Messages.M011);
      setDeleteModalShow(false);
      fetchUsers();
    } catch (error) {
      message.success(Messages.M012);
      console.error("Error updating user:", error);
    }
    if (isSearchActive) {
      setTotalFilteredRows((prevTotal) => prevTotal - 1);
    }
  };

  // Show the delete modal for a user
  const deleteshowModal = (userId) => {
    setSelectedUserId(userId);
    setDeleteModalShow(true);
  };

  // Show the edit modal for a user
  const editshowModal = (userId) => {
    setSelectedUserId(userId);
    setEditModalShow(true);
    handleEditUser(userId);
  };

  // "OK" button click handler for the delete modal
  const handleModalOk = () => {
    if (selectedUserId) {
      handleDelete(selectedUserId);
    }
  };

  // Modal cancel button click handler
  const handleModalCancel = () => {
    setDeleteModalShow(false);
    setEditModalShow(false);
  };

  // Column definitions for the table
  const columns = [
    {
      title: "番号",
      dataIndex: "_id",
      key: "id",
      render: (_, record, index) => {
        const pageIndex = currentPage === 1 ? 0 : (currentPage - 1) * 10;
        return pageIndex + index + 1;
      },
    },
    {
      title: "ユーザー名",
      dataIndex: "user_name",
      key: "username",
      render: (_, record) => `${record.user_name} ${record.user_name_last}`,
    },
    {
      title: "メールアドレス",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email", "メールアドレス"),
    },
    {
      title: "ユーザー権限",
      dataIndex: "user_level",
      key: "role",
      sorter: (a, b) => a.user_level.localeCompare(b.user_level),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => editshowModal(record._id)}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => deleteshowModal(record._id)}
          />
        </Space>
      ),
    },
  ];

  // Handle pagination changes
  const onChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    const searchTerm = searchText.toLowerCase();
    const filteredData = data.filter((record) =>
      record[searchedColumn]
        ? record[searchedColumn].toString().toLowerCase().includes(searchTerm)
        : ""
    );
    setTotalFilteredRows(
      filteredData.filter((user) => user.del_flg === "0").length
    );
  };

  // Pagination configuration
  const paginationConfig = {
    pageSize: 10,
    current: currentPage,
  };

  // Get filtered data based on 'del_flg' property
  const filteredData = data?.filter((user) => user.del_flg === "0");

  return (
    <>
      <Helmet>
        <title>User Management</title>
        <link rel="icon" type="image/png" href="/path/to/favicon.png" />
      </Helmet>
      <div className={styles["row-count"]} style={{ color: "green" }}>
        Total :{" "}
        {isSearchActive ? totalFilteredRows : initialUndeletedUsersCount} rows{" "}
      </div>
      <div className={styles.responsiveTable}>
        <Table
          columns={columns}
          dataSource={filteredData.map((user) => ({ ...user, key: user._id }))}
          loading={loading}
          onChange={onChange}
          pagination={paginationConfig}
          className={styles.table}
        />
      </div>
      <Modal
        centered
        open={deleteModalShow}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <p className={styles["confrimation-message"]}>{Messages.M010}</p>
      </Modal>
      <Modal
        title="Edit User"
        centered
        open={editModalShow}
        onOk={handleEdit}
        onCancel={handleModalCancel}
      >
        <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
          <Form.Item
            label="ユーザー名[姓]"
            name="firstName"
            rules={[{ required: true, message: Messages.M013 }]}
          >
            <Input className={styles["usermanagement-input"]} disabled />
          </Form.Item>
          <Form.Item
            label="ユーザー名[名]"
            name="lastName"
            rules={[{ required: true, message: Messages.M014 }]}
          >
            <Input className={styles["usermanagement-input"]} disabled />
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
                  value: "admin",
                  label: "Admin",
                },
                {
                  value: "super admin",
                  label: "Super Admin",
                },
                {
                  value: "member",
                  label: "Member",
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Usermanagementtable;
