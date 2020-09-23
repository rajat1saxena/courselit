import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { TextField, Typography, Grid } from "@material-ui/core";

const ButtondownAdmin = (props) => {
  const { fetchBuilder, name, auth } = props;
  const [settings, setSettings] = useState({});
  const [newSettings, setNewSettings] = useState({});

  useEffect(() => {
    getSettings();
  }, [name]);

  const getSettings = async () => {
    const query = `
    query {
        settings: getWidgetSettings(name: "${name}") {
            settings
        }
    }
    `;

    const fetch = fetchBuilder.setPayload(query).build();
    try {
      const response = await fetch.exec();
      if (response.settings) {
        onNewSettingsReceived(response.settings.settings);
      }
    } catch (err) {}
  };

  const onNewSettingsReceived = (settings) => {
    const parsedSettings = JSON.parse(settings);
    setSettings(parsedSettings);
    setNewSettings(parsedSettings);
  };

  const onChangeData = (e) => {
    setNewSettings(
      Object.assign({}, newSettings, {
        [e.target.name]: e.target.value,
      })
    );
  };

  const saveWidgetSettings = async (event) => {
    event.preventDefault();

    const mutation = `
    mutation {
      settings: saveWidgetSettings(widgetSettingsData: {
        name: "${name}",
        settings: "${JSON.stringify(newSettings).replace(/"/g, '\\"')}"
      }) {
        settings
      }
    }
    `;

    const fetch = fetchBuilder
      .setPayload(mutation)
      .setAuthToken(auth.token)
      .build();
    try {
      const response = await fetch.exec();
      if (response.settings) {
        onNewSettingsReceived(response.settings.settings);
      }
    } catch (err) {}
  };

  return (
    <>
      <Grid item>
        <Typography variant="h4">Buttondown</Typography>
      </Grid>
      <Grid item>
        <Typography variant="h6" color="textSecondary">
          Settings
        </Typography>
      </Grid>
      <Grid item>
        <form onSubmit={saveWidgetSettings}>
          <TextField
            variant="outlined"
            label="Newsletter Link"
            fullWidth
            margin="normal"
            name="url"
            value={newSettings.url || ""}
            onChange={onChangeData}
            required
          />
          <button
            type="submit"
            value="Save"
            disabled={newSettings.url === settings.url}
          >
            Save
          </button>
        </form>
      </Grid>
    </>
  );
};

ButtondownAdmin.propTypes = {
  name: PropTypes.string.isRequired,
  fetchBuilder: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  auth: PropTypes.shape({
    guest: PropTypes.bool,
    token: PropTypes.string,
  }),
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(ButtondownAdmin);