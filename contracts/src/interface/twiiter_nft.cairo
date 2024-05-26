use starknet::ContractAddress;

#[starknet::interface]
trait ITwitterNft<TContractState> {
    fn mint(ref self: TContractState, token_id: u256, value: u256, sig: (felt252, felt252));

    fn batched_mint(
        ref self: TContractState, token_ids: Span<u256>, values: Span<u256>, sig: (felt252, felt252)
    );

    // admin
    fn enable_contract(ref self: TContractState);
    fn disable_contract(ref self: TContractState);
    fn transferFrom(
        ref self: TContractState, from: ContractAddress, to: ContractAddress, token_id: u256
    );
    fn transfer_from(
        ref self: TContractState, from: ContractAddress, to: ContractAddress, token_id: u256
    );
    fn get_existing_supply(self: @TContractState, token_id: u256) -> u256;
}
