import { createTheme } from '@material-ui/core/styles';

const base = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#005aff',
    },
    // grey: { main: '#ededed' },
    secondary: { main: '#FF851B' },
    // background: { main: '#f9f9f9' },
    text: { main: '#050505' },
    default: {
      main: '#e0e0e0',
      dark: '#d5d5d5',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    action: {
      selectedOpacity: 0.16,
    },
  },
});

const main = createTheme(
  {
    components: {
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiFormControl: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiGrid: {
        defaultProps: {
          spacing: 2,
        },
      },
      MuiButton: {
        defaultProps: {
          variant: 'contained',
          disableElevation: true,
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#00005e',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            '.MuiAppBar-root &:hover': {
              backgroundColor: 'rgba(256, 256, 256, 0.16)',
            },
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          secondary: {
            '.MuiAppBar-root &': {
              color: 'rgba(256, 256, 256, 0.6)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '.MuiAppBar-root &': {
              color: 'rgba(256, 256, 256, 0.6)',
            },
            '.MuiAppBar-root &:hover': {
              backgroundColor: 'rgba(256, 256, 256, 0.16)',
            },
          },
        },
      },
      MuiDateRangePicker: {
        defaultProps: {
          inputFormat: 'dd/MM/yyyy',
        },
      },
      MuiDatePicker: {
        defaultProps: {
          inputFormat: 'dd/MM/yyyy',
        },
      },
      MuiBreadcrumbs: {
        defaultProps: {
          maxItems: 4,
        },
      },
    },
  },
  base,
);

export default main;
