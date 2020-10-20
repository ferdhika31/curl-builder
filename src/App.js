import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Alert from '@material-ui/lab/Alert';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles((theme) => ({
	formControl: {
		margin: theme.spacing(1),
		minWidth: 170,
	},
	btn: {
		lineHeight: 4
	}
}));

export default function App() {
	const classes = useStyles();
	const [methods, setMethods] = useState([]);
	const [bodyType, setBodyType] = useState([]);
	const [jsonBody, setJsonBody] = useState("");
	const [customFields, setCustomFields] = useState([]);
	const [state, setState] = useState({
		curl_command_text: "",
		http_method: "-",
		body_type: "-",
		uri: "https://reqres.in/api/users/2",
		is_json: false,
		is_json_valid: true,
		is_accept_selfsigned : false,
		is_verbose: false,
		custom_headers: [{
			key : "Authorization",
			value : "Bearer xxx"
		}]
	});
	const [curlCommandText, setCurlCommandText] = useState("curl");

	useEffect(() => {
		setMethods(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
		setBodyType(['JSON', 'FORM DATA', 'FORM URLENCODED'])
		buildCommand()
	}, [state])

	const resetCustomFields = () => {
		setState({
			...state,
			is_json_valid: true
		});

		setJsonBody("")
		if (state.body_type.toLowerCase() == "json") {
			setCustomFields([])
		}
		buildCommand();
	  }

	const jsonChecker = (event) => {
		try {
			let json_body = JSON.stringify(JSON.parse(event.target.value), null, 4);
			setJsonBody(json_body)
			setState({
				...state,
				is_json_valid: true
			});
			buildCommand();
		} catch (e) {
			setJsonBody(event.target.value)
			setState({
				...state,
				is_json_valid: false
			});
		}
	}

	const handleChange = (event) => {
		const name = event.target.name;
		if (name === "body_type"){
			resetCustomFields()
		}
		setState({
			...state,
			[name]: event.target.value,
		});
		buildCommand()
	};

	const handleChangeCb = (event) => {
		const name = event.target.name;
		setState({
			...state,
			[name]: event.target.checked,
		});
		console.log("cb change", state[name])
		buildCommand()
		console.log("cb change done", event.target.checked)
	};

	const addCustomHeader = () => {
		state.custom_headers.push({
			key: "",
			value: "",
		});

		setState({...state});
		buildCommand()
	}

	const handleChangeHeader = (event, index) => {
		const { name, value } = event.target;
		const custom_headers = [...state.custom_headers];
		custom_headers[index][name] = value;
		setState({...state, custom_headers: custom_headers});
		buildCommand()
	}

	const removeCustomHeader = (index) => {
		const custom_headers = [...state.custom_headers];
		custom_headers.splice(index, 1);
		setState({...state, custom_headers: custom_headers});
		buildCommand()
	}

	const addCustomField = () => {
		setCustomFields([...customFields, { key: "", value: "" }]);
		buildCommand()
	}

	const handleChangeField = (event, index) => {
		const { name, value } = event.target;
		const custom_fields = [...customFields];
		custom_fields[index][name] = value;
		setCustomFields(custom_fields);
		buildCommand()
	}

	const removeCustomField = (index) => {
		const custom_fields = [...customFields];
		custom_fields.splice(index, 1);
		setCustomFields(custom_fields);
		buildCommand()
	}

	const buildCommand = () => {
		let curl_command_string = "curl";
		if (state.is_verbose) {
			curl_command_string = curl_command_string + " -v";
		}

		if (state.is_accept_selfsigned) {
			curl_command_string = curl_command_string + " --insecure";
		}

		if (state.http_method !== "-" && state.http_method !== "") {
			curl_command_string = curl_command_string + " --location --request " + state.http_method;
		}

		if (state.is_json) {
			if (state.body_type.toLowerCase() === "json") {
				curl_command_string = curl_command_string + ' --header "Content-type: application/json"';
			}
		}

		if (state.custom_headers.length > 0) {
			let custom_headers = state.custom_headers;
			for (let index = 0; index < custom_headers.length; index++) {
				if (custom_headers[index].key != "" && custom_headers[index].value != "") {
					curl_command_string = curl_command_string + ' --header "' + custom_headers[index].key + ": " + custom_headers[index].value + '" ';
				}
			}
		}

		if (state.body_type.toLowerCase() === "json" && state.is_json_valid && jsonBody !== "") {
			let json_body = JSON.stringify(JSON.parse(jsonBody));
			curl_command_string = curl_command_string + " --data-raw '" + json_body + "'";
		}
	
		if (state.body_type.toLowerCase() === "form urlencoded" && customFields.length !== 0) {
			let str = "";
			console.log(state.body_type.toLowerCase(), customFields)
			for (let index = 0; index < customFields.length; index++) {
				if (customFields[index].key !== "" && customFields[index].value !== "") {
					if (str !== "") {
						str += "&";
					}
					str +=
						customFields[index].key +
						"=" +
						customFields[index].value;
				}
			}
			curl_command_string =
				curl_command_string + " --data-urlencode '" + str + "'";
			curl_command_string =
				curl_command_string +
				' --header "Content-Type: application/x-www-form-urlencoded"';
		}

		if (state.body_type.toLowerCase() == "form data" && customFields.length !== 0) {
			for (let index = 0; index < customFields.length; index++) {
				if (customFields[index].key != "" && customFields[index].value != "") {
					let str = " --form '" + customFields[index].key + "=" + customFields[index].value + "' ";
					curl_command_string = curl_command_string + str;
					curl_command_string = curl_command_string + ' --header "Content-Type: multipart/form-data"';
				}
			}
		}

		if (state.uri != "") {
			curl_command_string = curl_command_string + " '" + state.uri + "'";
		}

		setCurlCommandText(curl_command_string);
	}

  return (
	<Container>
		<Card variant="outlined">
			<CardContent>
				<CardHeader
					title="CURL Command Builder"
				/>
				<div className="container-fluid">
					<Card variant="outlined" className="mt-2">
						<CardContent>
							<div className="row">
								<div className="col-md-3">
									<FormControl fullWidth variant="outlined" className={classes.formControl}>
										<InputLabel htmlFor="outlined-age-native-simple">Request Method</InputLabel>
										<Select native value={state.http_method} onChange={handleChange} label="Request Method" inputProps={{
											name: 'http_method',
											id: 'outlined-age-native-simple',
										}}>
											<option value="-">--- HTTP METHOD ---</option>
											{methods.map((method, index) => {
												return <option key={index} value={method}>{method}</option>
											})}
										</Select>
									</FormControl>
								</div>
								<div className="col-md-9">
									<FormControl fullWidth variant="outlined" className={classes.formControl} onChange={handleChange}>
										<TextField name="uri" id="outlined-basic" label="URI" variant="outlined" value={state.uri} />
									</FormControl>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card variant="outlined" className="mt-2">
						<CardContent>
							<div className="row text-center mt-3">
								<div className="col-md-3">
									<FormControlLabel
										control={
										<Checkbox
											checked={state.is_json}
											onChange={handleChangeCb}
											name="is_json"
											color="primary"
										/>
										}
										label="JSON Content-Type"
									/>
								</div>
								<div className="col-md-3">
									<FormControlLabel
										control={
										<Checkbox
											checked={state.is_accept_selfsigned}
											onChange={handleChangeCb}
											name="is_accept_selfsigned"
											color="primary"
										/>
										}
										label="Accept self-signed certs"
									/>
								</div>
								<div className="col-md-3">
									<FormControlLabel
										control={
										<Checkbox
											checked={state.is_verbose}
											onChange={handleChangeCb}
											name="is_verbose"
											color="primary"
										/>
										}
										label="Verbose"
									/>
								</div>
								<div className="col-md-3 ">
									<Button variant="contained" color="primary" onClick={addCustomHeader}>
										Add Custom Header
									</Button>
								</div>
							</div>
							
							{state.custom_headers.map((ch, index) => {

								return (
									<div className="row text-center" key={index}>
										<div className="col-md-5">
											<FormControl fullWidth variant="outlined" className={classes.formControl} onChange={(e) => handleChangeHeader(e, index)}>
												<TextField name="key" id="outlined-basic" label="Key" variant="outlined" value={ch.key} />
											</FormControl>
										</div>
										<div className="col-md-5">
											<FormControl fullWidth variant="outlined" className={classes.formControl} onChange={(e) => handleChangeHeader(e, index)}>
												<TextField name="value" id="outlined-basic" label="Value" variant="outlined" value={ch.value} />
											</FormControl>
										</div>
										<div className={"col-md-2 "+classes.btn}>
										<Button
											variant="contained"
											color="secondary"
											className={classes.button}
											startIcon={<DeleteIcon />}
											onClick={() => removeCustomHeader(index)}
										>
											Delete
										</Button>
										</div>
									</div>
								)
							})}
						</CardContent>
					</Card>

					<Card variant="outlined" className="mt-2">
						<CardContent>
							<FormControl className="col-md-3" variant="outlined" className={classes.formControl}>
								<InputLabel htmlFor="outlined-age-native-simple">Body Type</InputLabel>
								<Select native value={state.body_type} onChange={handleChange} label="Body Type" inputProps={{
									name: 'body_type',
									id: 'outlined-age-native-simple',
								}}>
									<option value="-">--- BODY TYPE ---</option>
									{bodyType.map((body_type, index) => {
										return <option key={index} value={body_type}>{body_type}</option>
									})}
								</Select>
							</FormControl>
							{(state.body_type.toLowerCase() === 'form data' || state.body_type.toLowerCase() === 'form urlencoded') &&
							<Button className={classes.btn}
								variant="contained"
								color="primary"
								onClick={addCustomField}
							>
								Add Custom Field
							</Button>
							}
							
							{state.body_type.toLowerCase() === 'json' && state.body_type.toLowerCase() !== '' &&
							<FormControl fullWidth variant="outlined" className={classes.formControl}>
								<TextareaAutosize name="json_body" className="form-control" aria-label="json" rowsMin={10} onChange={jsonChecker} placeholder="JSON" value={state.json_body} />
								<br/>
								{!state.is_json_valid &&
								<Alert severity="error">Wadaaw! Invalid json format.</Alert>
								}
							</FormControl>
							}
							
							{(state.body_type.toLowerCase() === 'form data' || state.body_type.toLowerCase() === 'form urlencoded') &&
							<>
							{customFields.map((cf, index) => {

								return (
									<div className="row text-center" key={index}>
										<div className="col-md-5">
											<FormControl fullWidth variant="outlined" className={classes.formControl} onChange={(e) => handleChangeField(e, index)}>
												<TextField name="key" id="outlined-basic" label="Key" variant="outlined" value={cf.key} />
											</FormControl>
										</div>
										<div className="col-md-5">
											<FormControl fullWidth variant="outlined" className={classes.formControl} onChange={(e) => handleChangeField(e, index)}>
												<TextField name="value" id="outlined-basic" label="Value" variant="outlined" value={cf.value} />
											</FormControl>
										</div>
										<div className={"col-md-2 "+classes.btn}>
										<Button
											variant="contained"
											color="secondary"
											className={classes.button}
											startIcon={<DeleteIcon />}
											onClick={() => removeCustomField(index)}
										>
											Delete
										</Button>
										</div>
									</div>
								)
							})}
							</>
							}
						</CardContent>
					</Card>

					<Card variant="outlined" className="mt-2">
						<CardContent>
							<FormControl fullWidth variant="outlined" className={classes.formControl}>
								Result :
								<TextareaAutosize readonly className="form-control" aria-label="json" rowsMin={3} placeholder="JSON" value={curlCommandText}/>
							</FormControl>
						</CardContent>
					</Card>
				</div>
			</CardContent>
		</Card>
		</Container>
	);
}