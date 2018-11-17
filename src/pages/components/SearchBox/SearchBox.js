import React from 'react'
import defaultSearchIcon from './images/search.png'
import './SearchBox.less'

export default class SearchBox extends React.Component {
  static defaultProps = {
    onChange: () => {},
    onSearch: () => {},
    searchIcon: defaultSearchIcon,
    iconPosition: 'leftInner',
    placeholder: '搜索',
  }

  constructor(props) {
    super(props)
    this.setIconPosition()
  }

  state = {
    inputText: ''
  }

  handleChange = e => {
    const text = e.target.value

    this.setState({
      inputText: text
    })

    this.props.onChange(text)
  }

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.handleSearch()
    }
  }

  handleSearch = () => {
    this.props.onSearch(this.state.inputText)
  }

  setIconPosition() {
    const { iconPosition } = this.props

    if (typeof iconPosition !== 'string') {
      return
    }

    const iconPositionNoSpaceLowercase = iconPosition
      .split(/[ ]+/)
      .join('')
      .trim()
      .toLowerCase()

    this.iconAtLeft = true
    this.iconAtInner = true
    switch (iconPositionNoSpaceLowercase) {
      case 'outer':
      case 'outerleft':
      case 'leftouter':
        this.iconAtInner = false
        break
      case 'right':
      case 'innerright':
      case 'rightinner':
        this.iconAtLeft = false
        break
      case 'rightouter':
      case 'outerright':
        this.iconAtLeft = false
        this.iconAtInner = false
        break
      case 'inner':
      case 'left':
      case 'leftinner':
      case 'innerleft':
      default:
        break
    }
  }

  render() {
    const { style, inputStyle, iconStyle, searchIcon, placeholder } = this.props
    const { inputText } = this.state
    const { iconAtLeft, iconAtInner } = this

    let boxClassNameIO = 'search-box-icon-at-inner'
    let inputClassNameIO = 'search-input-icon-at-inner'
    let inputClassNameLR = 'search-input-icon-at-left'
    let iconClassNameLR = 'search-icon-icon-at-left'

    if (!iconAtInner) {
      boxClassNameIO = 'search-box-icon-at-outer'
      inputClassNameIO = 'search-input-icon-at-outer'
      inputClassNameLR = 'search-input-icon-at-left'
      iconClassNameLR = 'search-icon-icon-at-left'
    }

    if (!iconAtLeft) {
      inputClassNameLR = 'search-input-icon-at-right'
      iconClassNameLR = 'search-icon-icon-at-right'
    }

    const searchBtn = (
      <img
        className={`search-icon ${iconClassNameLR}`}
        style={iconStyle}
        src={searchIcon}
        alt=""
        onClick={this.handleSearch}
      />
    )

    return (
      <div className={`search-box ${boxClassNameIO}`} style={style}>
        {iconAtLeft && searchBtn}
        <input
          className={`search-input ${inputClassNameIO} ${inputClassNameLR}`}
          style={inputStyle}
          placeholder={placeholder}
          value={inputText}
          onChange={this.handleChange}
          onKeyPress={this.handleKeyPress}
        />
        {!iconAtLeft && searchBtn}
      </div>
    )
  }
}
