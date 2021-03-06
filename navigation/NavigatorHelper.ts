import React, {FunctionComponent, Ref} from "react";
import {NavigationContainerRef, StackActions, DrawerActions, CommonActions} from "@react-navigation/native";
import {RegisteredRoutesMap} from "./RegisteredRoutesMap";
import ServerAPI from "../ServerAPI";
import {RouteRegisterer} from "./RouteRegisterer";
import {Home} from "../screens/home/Home";
import App from "../App";


// todo Update to newest ReactNavigation
// https://reactnavigation.org/docs/navigating-without-navigation-prop/

export const navigationRef: Ref<NavigationContainerRef> = React.createRef();

export class NavigatorHelper {

    static toggleDrawer(){
        NavigatorHelper.getCurrentNavigation()?.dispatch(DrawerActions.toggleDrawer());
    }

    static openDrawer(){
        NavigatorHelper.getCurrentNavigation()?.dispatch(DrawerActions.openDrawer());
    }

    static closeDrawer(){
        NavigatorHelper.getCurrentNavigation()?.dispatch(DrawerActions.closeDrawer());
    }

    static getRouteParams(props){
        return props.route.params || {};
    }

    static getCurrentNavigation(){
        // @ts-ignore
        return navigationRef?.current;
    }

    static async handleContinueAfterAuthenticated(){
        await NavigatorHelper.navigate(Home)
        await App.setHideDrawer(false);
    }

    static async navigateHome(){
        let me = null;
        try {
            me = await App.loadUser();
        } catch (err){
            console.log(err);
        }
        if(!!me){
            NavigatorHelper.navigate(RouteRegisterer.HOME_AUTHENTICATED)
        } else {
            NavigatorHelper.navigate(RouteRegisterer.HOME_UNAUTHENTICATED)
        }
    }

    //https://github.com/react-navigation/react-navigation/issues/6674
    static getEmptyParams(): object {
        const nativeState = NavigatorHelper.getCurrentNavigation()?.getRootState();
        const webState = NavigatorHelper.getCurrentNavigation()?.dangerouslyGetState();
        let state = nativeState || webState;
        let keys: string[] = [];
        try{
            /**
            let routes = state?.routes;
            console.log("routes: ", routes);
            for(let route of routes){
                console.log("route: ", route);
                let routeParams = route?.params || {};
                console.log("routeParams: ", routeParams)
                let routeKeys = Object.keys(routeParams);
                console.log("routeKeys: ", routeKeys);
                keys = Array.prototype.concat(routeKeys);
            }
             */
            keys = Array.prototype.concat(
                ...state?.routes?.map((route) =>
                    Object.keys((route as any)?.params || {})
                )
            );
        } catch (err){
            console.log("getEmptyParams() error");
            console.log(err);
        }
        return keys.reduce((acc, k) => ({ ...acc, [k]: undefined }), {});
    }

    static getNavigationStateRoutes(){
        const state = NavigatorHelper.getCurrentNavigation()?.dangerouslyGetState();
        let routes = state?.routes || [];
        return routes;
    }

    static navigateWithoutParams(registeredComponent: FunctionComponent, resetHistory: boolean=false, newParams=null){
        //NavigatorHelper.clearURLParams();
        let emptyProps = NavigatorHelper.getEmptyParams();
        if(!newParams){
            newParams = {};
        }
        emptyProps = {...emptyProps, ...newParams};
        NavigatorHelper.navigate(registeredComponent, emptyProps, resetHistory);
    }

    static navigate(registeredComponent: FunctionComponent, props=null, resetHistory: boolean = false){
        let routeName = RegisteredRoutesMap.getRouteByComponent(registeredComponent);
        NavigatorHelper.navigateToRouteName(routeName, props, resetHistory)
    }

    //https://stackoverflow.com/questions/43090884/resetting-the-navigation-stack-for-the-home-screen-react-navigation-and-react-n
    private static resetHistory(routeName: string, props={}){
        let route = { name: routeName, params: props};
        return NavigatorHelper.getCurrentNavigation()?.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    route,
                ],
            })
        );
    }

    static navigateToRouteName(routeName: string, props= {}, resetHistory: boolean = false){
        if(resetHistory){
            return NavigatorHelper.resetHistory(routeName, props);
        }

    /**
        //props.test = Math.random();
        let routes = NavigatorHelper.getNavigationStateRoutes();
        let route = { name: routeName, params: props};
        //routes.push(route);
        return NavigatorHelper.getCurrentNavigation()?.dispatch({
            ...CommonActions.navigate(routeName, props)
        });
    */

        // @ts-ignore
        //NavigatorHelper.getCurrentNavigation()?.dispatch(StackActions.push(routeName, props));
        NavigatorHelper.getCurrentNavigation()?.dispatch(DrawerActions.jumpTo(routeName, {...props}));
    }

}