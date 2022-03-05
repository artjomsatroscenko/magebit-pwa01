import React from "react";
import PropTypes from "prop-types";
import classes from "./tabs.module.css";

const TabPane = ({ children }) => {
    return <div className={classes.tabPane}>{children}</div>;
};

TabPane.propTypes = {
    name: PropTypes.string
};

export default TabPane;
