import React, {useEffect, useState} from "react";
import TabPane from "./tabPane";
import classes from "./tabs.module.css";

const Tabs = ({children}) => {
    const [tabHeader, setTabHeader] = useState([]);
    const [childContent, setChildContent] = useState({});
    const [active, setActive] = useState("");

    useEffect(() => {
        const headers = [];
        const childCnt = {};
        React.Children.forEach(children, (element) => {
            if (!React.isValidElement(element)) return;
            const {name} = element.props;
            headers.push(name);
            childCnt[name] = element.props.children;
        });
        setTabHeader(headers);
        setActive(headers[0]);
        setChildContent({...childCnt});
    }, [children]);

    const changeTab = (name) => {
        setActive(name);
    };

    return (
        <div className={classes.tabGroup}>
            <div className={classes.tabs}>
                {tabHeader.map((item) => (
                    <div
                        onClick={() => changeTab(item)}
                        key={item}
                        className={item === active ? classes.active : classes.notActive}
                        role="presentation"
                    >
                        {item}
                    </div>
                    ))}
            </div>
            <div className={classes.tabContent}>
                {Object.keys(childContent).map((key) => {
                    if (key === active) {
                        return <div className={classes.child}>{childContent[key]}</div>;
                    } else {
                        return null;
                    }
                })}
            </div>
        </div>
    );
};

Tabs.propTypes = {
    children: function (props, propName, componentName) {
        const prop = props[propName];

        let error = null;
        React.Children.forEach(prop, function (child) {
            if (child.type !== TabPane) {
                error = new Error(
                    "`" + componentName + "` children should be of type `TabPane`."
                );
            }
        });
        return error;
    }
};

export default Tabs;
