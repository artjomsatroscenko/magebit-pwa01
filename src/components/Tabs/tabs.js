import React, {useState} from 'react';
import {useProductFullDetail} from '@magento/peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import RichContent from '/var/www/learning3/pwa-learning/node_modules/@magento/venia-ui/lib/components/RichContent/richContent.js';
import {Tabs} from "react-tabs";
import classes from './tabs.module.css';


export const TabGroup = (props) => {
    const {
        descName,
        descLabel,
        descContent,
        attrName,
        attrLabel,
        attrContent
    } = props;
    const [currentTab, setCurrentTab] = useState('tab1');
    const tabList = [
        {
            name: descName,
            label: descLabel,
            content: descContent
        },
        {
            name: attrName,
            label: attrLabel,
            content: attrContent
        }
    ];
    return (
        <div className={classes.tabGroup}>

            <div className={classes.tabs}>
                {
                    tabList.map((tab, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentTab(tab.name)}
                            className={(tab.name === currentTab) ? classes.active : ''}>
                            {tab.label}
                        </button>
                    ))
                }
            </div>

            {
                tabList.map((tab, i) => {
                    if (tab.name === currentTab) {
                        return <div key={i}>{tab.content}</div>;
                    } else {
                        return null;
                    }
                })
            }
        </div>
    );
}
