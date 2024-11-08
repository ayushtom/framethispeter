#[starknet::contract]
mod TwitterNft {
    use openzeppelin::token::erc1155::erc1155::ERC1155Component::InternalTrait;
    use twitter_nft_contract::interface::{
        erc1155::{
            IERC1155_ID, IERC1155_METADATA_URI_ID, IERC1155_RECEIVER_ID
        },
        twitter_nft::ITwitterNft
    };
    use core::debug::PrintTrait;
    use openzeppelin::{
        introspection::{src5::SRC5Component},
        access::ownable::OwnableComponent,
        token::erc1155::{ERC1155Component, ERC1155HooksEmptyImpl,interface::IERC1155MetadataURI},
        upgrades::{UpgradeableComponent, interface::IUpgradeable},
    };
    use starknet::{get_contract_address, get_caller_address};
    use starknet::{ContractAddress, ClassHash};

    component!(path: ERC1155Component, storage: erc1155, event: ERC1155Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    #[abi(embed_v0)]
    impl OwnableCamelOnlyImpl =
        OwnableComponent::OwnableCamelOnlyImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

     // ERC1155 Mixin
     #[abi(embed_v0)]
     impl ERC1155MixinImpl = ERC1155Component::ERC1155MixinImpl<ContractState>;
     impl ERC1155InternalImpl = ERC1155Component::InternalImpl<ContractState>;


    #[storage]
    struct Storage {
        asset_mint_count: LegacyMap<u256, u256>,
        asset_cap: LegacyMap<u256, u256>,
        contract_enabled: bool,
        #[substorage(v0)]
        erc1155: ERC1155Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        TweetMinted: TweetMinted,
        #[flat]
        ERC1155Event: ERC1155Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    struct TweetMinted{
        #[key]
        token_id: u256,
        #[key]
        receiver: ContractAddress,
        tweet_id: u256,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        token_uri: ByteArray,
        admin_addr: ContractAddress,
    ) {
        self.erc1155.initializer(token_uri);
        self.ownable.initializer(admin_addr);
        self.contract_enabled.write(false);
    }


    #[abi(embed_v0)]
    impl TwitterNft of ITwitterNft<ContractState> {
        fn admin_mint(ref self: ContractState, token_id: u256, receiver: ContractAddress, tweet_id: u256 ) {
            assert(self.contract_enabled.read(), 'Contract is disabled');
            self.ownable.assert_only_owner();
            let current_supply = self.asset_mint_count.read(token_id);
            let asset_cap_supply = self.asset_cap.read(token_id);

            if(asset_cap_supply == 0){
                self.erc1155
                .mint_with_acceptance_check(
                    receiver,
                    token_id,   
                    1,
                    array![].span()
                );
                self.asset_mint_count.write(token_id, current_supply + 1);
                self.emit(Event::TweetMinted (TweetMinted{ token_id,receiver,tweet_id }));
                return;
            }
            assert(current_supply + 1 <= asset_cap_supply, 'Asset cap reached');
            self.erc1155
            .mint_with_acceptance_check(
                receiver,
                token_id,   
                1,
                array![].span()
            );

            self.asset_mint_count.write(token_id, current_supply+1);
            self.emit(Event::TweetMinted (TweetMinted{ token_id,receiver,tweet_id }));
        }

        fn transfer_from(
            ref self: ContractState, from: ContractAddress, to: ContractAddress, token_id: u256
        ) {
            self.safe_transfer_from(from, to, token_id, 1, array![].span());
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
            self.asset_mint_count.read(token_id)
        }

        fn get_asset_cap(self: @ContractState, token_id: u256) -> u256 {
            self.asset_cap.read(token_id)
        }

        fn supportsInterface(self: @ContractState, interface_id: felt252) -> bool {
            self.erc1155.supports_interface(interface_id)
        }

        fn set_base_uri(ref self: ContractState, base_uri: ByteArray) {
            self.ownable.assert_only_owner();
            self.erc1155.set_base_uri(base_uri);
        }

        fn set_asset_cap(ref self: ContractState, token_id: u256,asset_cap: u256) {
            self.ownable.assert_only_owner();
            self.asset_cap.write(token_id, asset_cap);
        }
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            // This function can only be called by the owner
            self.ownable.assert_only_owner();

            // Replace the class hash upgrading the contract
            self.upgradeable._upgrade(new_class_hash);
        }
    }

}