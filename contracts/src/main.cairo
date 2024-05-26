#[starknet::contract]
mod TwitterNft {
    use openzeppelin::{
        introspection::src5::SRC5Component,
        access::ownable::OwnableComponent,
        token::erc1155::{ERC1155Component, ERC1155HooksEmptyImpl}
    };
    use starknet::{get_contract_address, get_caller_address};
    use starknet::ContractAddress;
    use custom_uri::{interface::IInternalCustomURI, main::custom_uri_component};
    use twitter_nft::interface::{
        ITwitterNft,
        erc1155::{IERC1155_ID, IERC1155_METADATA_URI_ID, IERC1155_RECEIVER_ID},
    };

    component!(path: ERC1155Component, storage: erc1155, event: ERC1155Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: custom_uri_component, storage: custom_uri, event: CustomUriEvent);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;
    impl SRC5InternalImpl = SRC5Component::InternalImpl<ContractState>;
    
    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    #[abi(embed_v0)]
    impl OwnableCamelOnlyImpl =
        OwnableComponent::OwnableCamelOnlyImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;


    // ERC1155 Mixin
    #[abi(embed_v0)]
    impl ERC1155MixinImpl = ERC1155Component::ERC1155MixinImpl<ContractState>;
    impl ERC1155InternalImpl = ERC1155Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        server_pub_key: felt252,
        asset_mint_supply: LegacyMap<u256, u256>,
        #[substorage(v0)]
        erc1155: ERC1155Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        custom_uri: custom_uri_component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC1155Event: ERC1155Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        CustomUriEvent: custom_uri_component::Event
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        token_uri_base: Span<felt252>,
        admin_addr: ContractAddress,
        public_key: felt252,
    ) {
        self.custom_uri.set_base_uri(token_uri_base);
        self.ownable.initializer(admin_addr);
        self.server_pub_key.write(public_key);
        // allow to be detected as ERC1555 compatible
        self.src5.register_interface(IERC1155_ID);
        self.src5.register_interface(IERC1155_METADATA_URI_ID);
    }


    #[abi(embed_v0)]
    impl TwitterNft of ITwitterNft<ContractState> {
        fn mint(ref self: ContractState, token_id: u256, value: u256, sig: (felt252, felt252)) {
            assert(self.contract_enabled.read(), 'Contract is disabled');
            let caller = get_caller_address();

            // // verify signature
            // let caller_felt: felt252 = caller.into();
            // let value_felt: felt252 = value.try_into().unwrap();
            // let message_hash = LegacyHash::hash(
            //         LegacyHash::hash(
            //             LegacyHash::hash('twitter nft mint', caller_felt), token_id
            //     ),
            //     value_felt
            // );
            // let public_key = self.server_pub_key.read();
            // let (sig0, sig1) = sig;
            // let is_valid = check_ecdsa_signature(message_hash, public_key, sig0, sig1);
            // assert(is_valid, 'Invalid signature');

            // update with acceptance check from address 0 to mint assets
            self
                .update_with_acceptance_check(
                    Zero::zero(),
                    caller,
                    array![token_id].span(),
                    array![value].span(),
                    array![].span()
                );
        }


        fn batched_mint(
            ref self: ContractState,
            token_ids: Span<u256>,
            values: Span<u256>,
            sig: (felt252, felt252)
        ) {
            assert(self.contract_enabled.read(), 'Contract is disabled');
            assert(token_ids.len() == values.len(), 'Invalid array length');

            let caller = get_caller_address();
            let assets_len = token_ids.len();

            // // verify signature
            // let caller_felt: felt252 = caller.into();
            // let message_hash = LegacyHash::hash(
            //     LegacyHash::hash(
            //         LegacyHash::hash(
            //             LegacyHash::hash('twitter nft multimint', caller_felt),
            //             LegacyHash::hash(asset_id_hash, assets_len)
            //         ),
            //         LegacyHash::hash(variant_id_hash, assets_len)
            //     ),
            //     LegacyHash::hash(value_hash, assets_len)
            // );
            // let public_key = self.server_pub_key.read();
            // let (sig0, sig1) = sig;
            // let is_valid = check_ecdsa_signature(message_hash, public_key, sig0, sig1);
            // assert(is_valid, 'Invalid signature');

            // update with acceptance check from address 0 to mint assets
            self
                .update_with_acceptance_check(
                    Zero::zero(), caller, token_ids, values, array![].span()
                );
        }

    }

    fn transfer_from(
        ref self: ContractState, from: ContractAddress, to: ContractAddress, token_id: u256
    ) {
        self.safe_transfer_from(from,to, token_id, 1, array![].span());
    }

    fn transferFrom(
        ref self: ContractState, from: ContractAddress, to: ContractAddress, token_id: u256
    ) {
        self.transfer_from(from, to, token_id);
    }


    // admin functions
    fn enable_contract(ref self: ContractState) {
        self.ownable.assert_only_owner();
        self.contract_enabled.write(true);
    }

    fn disable_contract(ref self: ContractState) {
        self.ownable.assert_only_owner();
        self.contract_enabled.write(false);
    }

    fn get_existing_supply(self: @ContractState, token_id: u256) -> u256 {
        self.asset_mint_supply.read(token_id)
    }
}