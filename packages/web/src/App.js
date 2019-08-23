import React, { Component } from "react";

import {
  mergeStyleSets,
  DefaultPalette,
  SearchBox,
  Stack,
  Spinner,
  MessageBar,
  MessageBarType,
  List,
  FocusZone,
  FocusZoneDirection,
  Image,
  Label,
  DocumentCard,
  DocumentCardImage,
  ImageFit,
  DocumentCardDetails,
  DocumentCardTitle
} from "office-ui-fabric-react";

import "./App.css";
import { Depths } from "@uifabric/fluent-theme/lib/fluent/FluentDepths";
import { FontSizes } from "@uifabric/fluent-theme/lib/fluent/FluentType";
import { NeutralColors } from "@uifabric/fluent-theme/lib/fluent/FluentColors";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import Container from "./store/Container";

initializeIcons();

class App extends Component {
  static styles = mergeStyleSets({
    root: {
      background: DefaultPalette.white,
      height: "100vh"
    },

    container: {
      display: "flex",
      justifyContent: "center",
      padding: "32px",
      flexWrap: "wrap"
    },

    search: {
      paddingTop: "100px",
      width: "400px"
    },

    autocomplete: {
      boxShadow: Depths.depth8,
      maxHeight: "200px",
      overflow: "auto",
      position: "absolute",
      width: "400px",
      zIndex: 1,
      background: NeutralColors.white
    },

    autoCompleteItem: {
      borderBottom: `1px solid ${NeutralColors.gray20}`,
      padding: "4px 8px",
      fontSize: FontSizes.size20,
      display: "flex",
      alignItems: "center",
      selectors: {
        ":hover": {
          backgroundColor: NeutralColors.gray20,
          cursor: "pointer"
        }
      }
    },

    flagIcon: {
      marginRight: "8px"
    },

    countryDetails: {
      margin: "14px",
      width: "250px"
    },
    countryTitle: {},
    otherInfoContainer: {
      padding: "0 16px"
    },
    subTitle: {
      fontSize: FontSizes.size14,
      fontWeight: "bold"
    }
  });

  static tokens = {
    fiveGapStack: {
      childrenGap: 5
    },
    tenGapStack: {
      childrenGap: 10
    }
  };

  constructor(props) {
    super(props);
    this.searchInputRef = React.createRef();
    this.state = {
      byAlphaCode: {},
      searchValue: "",
      loading: true,
      autocomplete: false
    };
  }

  componentDidMount() {
    fetch("https://restcountries.eu/rest/v2/all")
      .then(response => response.json())
      .then(data => {
        const byAlphaCode = this.normalize(data);
        const alphaCode = Object.keys(byAlphaCode);
        this.setState((state, props) => {
          return {
            ...state,
            byAlphaCode,
            alphaCode,
            loading: false,
            error: null
          };
        });
      })
      .catch(error => {
        this.setState((state, props) => {
          return {
            ...state,
            error
          };
        });
      });
  }

  normalize = (data = []) => {
    let _accumulator = {};
    data.reduce((accumulator, currentValue) => {
      Reflect.set(accumulator, currentValue.alpha3Code, currentValue);
      return accumulator;
    }, _accumulator);
    return _accumulator;
  };

  onSearch = (value = "") => {
    value.trim() &&
      this.setState(state => {
        return {
          ...state,
          autocomplete: false,
          selectedCountries: this.filterItemBySearch(
            this.state.alphaCode,
            value
          )
        };
      });
  };

  onClearSearch = () => {
    this.setState(state => {
      return {
        ...state,
        searchValue: "",
        autocomplete: false
      };
    });
  };

  onSearchChange = value => {
    this.setState((state, props) => {
      return {
        ...state,
        searchValue: value.trim(),
        autocomplete: true
      };
    });
  };

  /**
   * Known bug.
   */
  onSearchBlur = () => {
    // this.setState((state, props) => {
    //   return {
    //     ...state,
    //     autocomplete: false
    //   };
    // });
  };

  getNeighbor = (codes = []) => {
    return codes.map(code => Reflect.get(this.state.byAlphaCode, code));
  };

  getLanguages = countryDetails => {
    return countryDetails.languages.map(language => language.name);
  };

  renderAutoCompleteItem = code => {
    const country = this.state.byAlphaCode[code];
    return (
      <div
        className={App.styles.autoCompleteItem}
        onClick={event => this.onSelectAutoComplete(event, code)}
        data-is-focusable={true}
      >
        <Image
          src={`${country.flag}`}
          className={App.styles.flagIcon}
          height="22px"
          width="30px"
        />
        <Label>
          {country.name} ({code})
        </Label>
      </div>
    );
  };

  renderCountryCard = code => {
    const countryDetails = Reflect.get(this.state.byAlphaCode, code);
    const neighbor = this.getNeighbor(countryDetails.borders).map(
      item => item.name
    );
    const languages = this.getLanguages(countryDetails);
    return (
      <DocumentCard key={code} className={App.styles.countryDetails}>
        <DocumentCardImage
          height={150}
          imageFit={ImageFit.cover}
          imageSrc={countryDetails.flag}
        />
        <DocumentCardDetails>
          <DocumentCardTitle
            title={`${countryDetails.name}`}
            shouldTruncate
            className={App.styles.countryTitle}
          />
          <div className={App.styles.otherInfoContainer}>
            <Label key="neighbor" className={App.styles.subTitle}>
              Neighbor
            </Label>
            <Label key="neighborValues">
              {(neighbor.length && neighbor.join(", ")) || "Didn't have yet"}
            </Label>
            <Label key="language" className={App.styles.subTitle}>
              Spoken Languages
            </Label>
            <Label key="languageValues">{languages.join(", ")}</Label>
          </div>
        </DocumentCardDetails>
      </DocumentCard>
    );
  };

  renderCountriesDetails = (selectedCountries = []) => {
    if (selectedCountries.length) {
      return selectedCountries.map(this.renderCountryCard);
    }
    return <Label> Please enter correct county code as per ISO 3166. </Label>;
  };

  filterItemBySearch = (alphaCodes, searchValue = "") => {
    return alphaCodes.filter(code => code.includes(searchValue.toUpperCase()));
  };

  onSelectAutoComplete = (event, code = "") => {
    console.log(event, code);
    this.setState((state, props) => {
      return {
        ...state,
        autocomplete: false,
        selectedCountries: [code],
        searchValue: code.toUpperCase()
      };
    });
  };

  render = () => {
    return (
      <div>
        <Stack
          tokens={App.tokens.fiveGapStack}
          padding={10}
          className={App.styles.root}
        >
          <Stack.Item align="center" className={App.styles.search}>
            {!this.state.loading && (
              <FocusZone direction={FocusZoneDirection.vertical}>
                <SearchBox
                  value={this.state.searchValue}
                  ref={this.searchInputRef}
                  componentRef={this.searchInputRef}
                  placeholder="Search"
                  onSearch={this.onSearch}
                  onChange={this.onSearchChange}
                  onClear={this.onClearSearch}
                  onEscape={this.onClearSearch}
                  onBlur={this.onSearchBlur}
                  autoComplete="off"
                />
                {this.state.autocomplete && (
                  <List
                    className={App.styles.autocomplete}
                    items={this.filterItemBySearch(
                      this.state.alphaCode,
                      this.state.searchValue
                    )}
                    onRenderCell={this.renderAutoCompleteItem}
                  />
                )}
              </FocusZone>
            )}
          </Stack.Item>
          <Stack.Item align="auto" grow={1} className={App.styles.container}>
            {!this.state.error && this.state.loading && (
              <div>
                <Spinner label="loading..." />
              </div>
            )}
            {this.state.selectedCountries &&
              this.renderCountriesDetails(this.state.selectedCountries)}
            {this.state.error && (
              <MessageBar
                messageBarType={MessageBarType.error}
                isMultiline={false}
                onDismiss={document.location.reload}
                dismissButtonAriaLabel="Close"
              >
                Error occurred while loading application. Please reload
                application
              </MessageBar>
            )}
          </Stack.Item>
        </Stack>
      </div>
    );
  };
}

export default Container(
  (state = { mew: "here I am" }, action) => state,
  {},
  "apple"
)(App);
