import { migrateActiveProfile } from '@core/profile'
import { get, writable } from 'svelte/store'
import { appRouter } from '../app-router'
import { LoginRoute } from '../enums'
import { FireflyEvent } from '../types'
import { Subrouter } from './subrouter'

export const loginRoute = writable<LoginRoute>(null)

export class LoginRouter extends Subrouter<LoginRoute> {
    constructor() {
        super(LoginRoute.Init, loginRoute)
    }

    next(event?: FireflyEvent): void {
        let nextRoute: LoginRoute
        const currentRoute = get(this.routeStore)
        switch (currentRoute) {
            case LoginRoute.Init: {
                if (event?.shouldAddProfile) {
                    get(appRouter).next(event)
                } else {
                    nextRoute = LoginRoute.EnterPin
                }
                break
            }
            case LoginRoute.EnterPin:
                // TODO: we shouldn't migrate every login..
                migrateActiveProfile()
                get(appRouter).next(event)
                break
        }
        this.setNext(nextRoute)
    }
}