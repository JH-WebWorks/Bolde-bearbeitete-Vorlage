"use strict";

var React = require('react');

require('../styles/row');

class RowMenu extends React.Component {

    constructor (props) {
        super(props);
        this.state = { show: false, off: this.off.bind(this) };
    }

    on (e) {
        document.addEventListener("click", this.state.off);
        this.setState({ show: true });
        e.stopPropagation();
    }

    off (e) {
        document.removeEventListener("click", this.state.off);
        this.setState({ show: false });
        e.stopPropagation();
    }

    render () {
        var as = this.props.actions;
        var titleStyle = {
            position: 'relative'
        };
        var dropStyle = {
            position: 'absolute',
            left: 0,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
        };
        return <a style={titleStyle} onClick={this.state.show?this.off.bind(this):this.on.bind(this)}>
            {this.props.title}
            {this.state.show?<div style={dropStyle}>
                {Object.keys(as).map(ax => <a key={ax} onClick={as[ax]}>{ax}</a>)}
            </div>:null}
        </a>;
    }

}

class Row extends React.Component {

    constructor (props) {
        super(props);
        var is = props.initShown;
        var size = 50;
        var numLetters = 0;
        this.state = { shown: is!==undefined?is:true, size, numLetters };
    }

    toggle (e) {
        this.setState({ shown: !this.state.shown });
        if (e) { e.stopPropagation(); }
    }

    open () {
        this.setState({ shown: true });
    }

    handleKeyUp() {
        // var size = this.state.size;
        var numLetters = this.state.numLetters;
/*        numLetters++;

        if(numLetters > 4) {
            size++;
            this.setState({size});
        }*/
        this.setState({numLetters});
    }

    render () {
        var as = this.props.actions || {};
        var col = this.props.collapsable;
        var preTitle = this.props.preTitle;
        return <div className="row">
            <div className={"row_header"+(col?" collapsable":'')}
                onClick={col?this.toggle.bind(this):null}>
                <span key="sp1" className="spacer" />
                <span style={{'fontWeight': 'bold', 'textcolor':'blue'}}>{preTitle}</span>
                <span key="title" ></span><input ref={d => this.title = d} type="text" style={{'color':'red'}} size={`${this.state.size}`} id="title" value={this.props.title}
                       onKeyUp={this.handleKeyUp.bind(this)} onChange={this.props.addName}/>

                <span key="sp2" className="spacer" />
                {Object.keys(as).map(ax => typeof as[ax] == 'object'
                    ?<RowMenu key={ax} title={ax} actions={as[ax]} />
                    :<a key={ax} onClick={this.notoggle.bind(this, as[ax])}>{ax}</a>
                 )}
            </div>
            {this.state.shown?
                <div className="row_body" style={{overflow: this.props.overflow || 'visible'}}>
                {this.props.children}
                </div>
                :null}
        </div>;
    }

    notoggle (action, e) {
        action();
        e.preventDefault();
        e.stopPropagation();
    }
}

module.exports = Row;
