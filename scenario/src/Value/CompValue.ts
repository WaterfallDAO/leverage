import {Event} from '../Event';
import {World} from '../World';
import {Comp} from '../Contract/Comp';
import {
    getAddressV,
    getNumberV
} from '../CoreValue';
import {
    AddressV,
    ListV,
    NumberV,
    StringV,
    Value
} from '../Value';
import {Arg, Fetcher, getFetcherValue} from '../Command';
import {getComp} from '../ContractLookup';

export function compFetchers() {
    return [
        new Fetcher<{ comp: Comp }, AddressV>(`
        #### Address

        * "<Comp> Address" - Returns the address of Comp token
          * E.g. "Comp Address"
      `,
            "Address",
            [
                new Arg("comp", getComp, {implicit: true})
            ],
            async (world, {comp}) => new AddressV(comp._address)
        ),

        new Fetcher<{ comp: Comp }, StringV>(`
        #### Name

        * "<Comp> Name" - Returns the name of the Comp token
          * E.g. "Comp Name"
      `,
            "Name",
            [
                new Arg("comp", getComp, {implicit: true})
            ],
            async (world, {comp}) => new StringV(await comp.methods.name().call())
        ),

        new Fetcher<{ comp: Comp }, StringV>(`
        #### Symbol

        * "<Comp> Symbol" - Returns the symbol of the Comp token
          * E.g. "Comp Symbol"
      `,
            "Symbol",
            [
                new Arg("comp", getComp, {implicit: true})
            ],
            async (world, {comp}) => new StringV(await comp.methods.symbol().call())
        ),

        new Fetcher<{ comp: Comp }, NumberV>(`
        #### Decimals

        * "<Comp> Decimals" - Returns the number of decimals of the Comp token
          * E.g. "Comp Decimals"
      `,
            "Decimals",
            [
                new Arg("comp", getComp, {implicit: true})
            ],
            async (world, {comp}) => new NumberV(await comp.methods.decimals().call())
        ),

        new Fetcher<{ comp: Comp }, NumberV>(`
        #### TotalSupply

        * "Comp TotalSupply" - Returns Comp token's total supply
      `,
            "TotalSupply",
            [
                new Arg("comp", getComp, {implicit: true})
            ],
            async (world, {comp}) => new NumberV(await comp.methods.totalSupply().call())
        ),

        new Fetcher<{ comp: Comp, address: AddressV }, NumberV>(`
        #### TokenBalance

        * "Comp TokenBalance <Address>" - Returns the Comp token balance of a given address
          * E.g. "Comp TokenBalance Geoff" - Returns Geoff's Comp balance
      `,
            "TokenBalance",
            [
                new Arg("comp", getComp, {implicit: true}),
                new Arg("address", getAddressV)
            ],
            async (world, {comp, address}) => new NumberV(await comp.methods.balanceOf(address.val).call())
        ),

        new Fetcher<{ comp: Comp, owner: AddressV, spender: AddressV }, NumberV>(`
        #### Allowance

        * "Comp Allowance owner:<Address> spender:<Address>" - Returns the Comp allowance from owner to spender
          * E.g. "Comp Allowance Geoff Torrey" - Returns the Comp allowance of Geoff to Torrey
      `,
            "Allowance",
            [
                new Arg("comp", getComp, {implicit: true}),
                new Arg("owner", getAddressV),
                new Arg("spender", getAddressV)
            ],
            async (world, {
                comp,
                owner,
                spender
            }) => new NumberV(await comp.methods.allowance(owner.val, spender.val).call())
        ),


    ];
}

export async function getCompValue(world: World, event: Event): Promise<Value> {
    return await getFetcherValue<any, any>("Comp", compFetchers(), world, event);
}
