import { Readable, derived } from 'svelte/store'
import NEW_SUPPLY_IOTA_STARDUST from '../assets/new_supply_iota_stardust.json'
import { VestingOutputStatus } from '../enums'
import { IVestingOverview } from '../interfaces'
import { selectedAccountVestingOutputs, selectedAccountVestingPayouts } from './'

export const selectedAccountVestingOverview: Readable<IVestingOverview> = derived(
    [selectedAccountVestingPayouts, selectedAccountVestingOutputs],
    ([$selectedAccountVestingPayouts, $selectedAccountVestingOutputs]) => {
        const remainingPayout =
            $selectedAccountVestingPayouts?.reduce(
                (acc, { totalAmount, status }) => (status === VestingOutputStatus.Locked ? acc + totalAmount : acc),
                0
            ) ?? 0
        // get the total rewards from the snapshot file
        const vestingAddresses = $selectedAccountVestingOutputs?.map(({ address }) => address) ?? []
        let totalRewards = vestingAddresses.reduce((acc, address) => {
            const amount = (NEW_SUPPLY_IOTA_STARDUST as { [address: string]: string })?.[address] ?? '0'
            return acc + parseInt(amount)
        }, 0)
        if (totalRewards <= 0) {
            // if the total rewards are 0, we can't calculate the accumulated payout so we estimate it
            // this is a dev only solution that affects addresses that are not in the new supply snapshot
            const accumulatedScheduledPayout =
                $selectedAccountVestingPayouts?.reduce(
                    (acc, { totalAmount, status }) =>
                        status === VestingOutputStatus.Unlocked ? acc + totalAmount : acc,
                    0
                ) ?? 0
            // note: we add the initial payout to the total rewards, 10% of the total rewards are paid out immediately
            totalRewards = ((accumulatedScheduledPayout + remainingPayout) * 100) / 90
        }
        const accumulatedPayout = totalRewards - remainingPayout
        return {
            accumulatedPayout,
            remainingPayout,
            totalRewards,
        }
    }
)
