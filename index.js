
if (typeof window.attach != 'undefined') {
  (function ABTestDrop() {
    var atm = window.attach;
    var me = {
      debug: atm.debug || false,
      id: 'dropdown',
      name: 'AB Test - Checkout Dropdown',
      data: {
        currentStep: 0,
        clickeableSteps: [0],
        numSteps: 0,
        completedSteps: [],
        allStepsCompleted: false,
        privacyChecked: false,
      },

      fn: {
        activateNextStep: function () {
          var nextStep = me.data.currentStep + 1;
          document.querySelector('.delosi-form-header[data-step="' + nextStep + '"]').click();
        },

        disableEnableConfirmBtn: function () {
          var confirmBtnEls = document.querySelectorAll('input.btn.movil');
          var privacyChecked = me.data.privacyChecked;
          var allStepsCompleted = me.data.allStepsCompleted;

          for (var i = 0; i < confirmBtnEls.length; i++) {
            if (privacyChecked && allStepsCompleted && me.data.completedSteps.length >= me.data.numSteps - 1) {
              confirmBtnEls[i].removeAttribute('disabled');
            } else {
              confirmBtnEls[i].setAttribute('disabled', 'disabled');
            }
          }
        },

        updateSteps: function () {
          var headerStepEls = document.querySelectorAll('.delosi-form-header');
          for (var i = 0; i < headerStepEls.length; i++) {
            var headerStepEl = headerStepEls[i];
            var formStepEl = headerStepEl.nextElementSibling;
            var stepStr = headerStepEl.getAttribute('data-step');
            var currentStep = me.data.currentStep;
            var circleItem = headerStepEl.querySelector('.circle-item');

            if (stepStr === null) {
              //Se agrega atributo con numero del paso a cada header
              headerStepEl.setAttribute('data-step', i);

              me.data.numSteps++;
              //Se agrega icono a cada header
              var iconContainerStr = `<div class="iconUpDown">&dtrif;</div>`;
              headerStepEl.insertAdjacentHTML('beforeend', iconContainerStr);
              // if (i !== headerStepEls.length - 1) {
              //Se agrega boton en cada formulario
              var buttonContainerEl = document.createElement('div');
              buttonContainerEl.classList.add('btn', 'btn-primary', 'btn-sm', 'btn-next-step');
              if (i === headerStepEls.length - 1) {
                buttonContainerEl.classList.add('hidden');
              }
              buttonContainerEl.innerHTML = 'Siguiente';
              buttonContainerEl.onclick = me.listeners.observerCallback;
              formStepEl.style.paddingBottom = '10px';
              formStepEl.insertAdjacentElement('beforeend', buttonContainerEl);
              // }
            }

            //Mostrar el paso actual
            if (currentStep === i) {
              // formStepEl.style.display = "block";
              formStepEl.classList.add('active');
              headerStepEl.querySelector('.iconUpDown').innerHTML = '&utrif;';
            } else {
              formStepEl.classList.remove('active');
              headerStepEl.querySelector('.iconUpDown').innerHTML = '&dtrif;';
            }

            //Cambiar color de paso actual
            if (me.data.completedSteps.indexOf(i) !== -1) {
              headerStepEl.querySelector('span.circle-item').classList.add('active');
            } else {
              headerStepEl.querySelector('span.circle-item').classList.remove('active');
            }

            // Habilitar el boton submit si estamos en el ultimo paso
            if (currentStep === me.data.numSteps - 1) {
              me.data.allStepsCompleted = true;
              circleItem.classList.add('active');
              me.fn.disableEnableConfirmBtn();
            }
            //Se añaden listeners a los pasos habilitados (mostrarse/ocultarse)
            if (me.data.clickeableSteps.includes(i)) {
              headerStepEl.removeEventListener('click', me.listeners.onHeaderStepClick);
              headerStepEl.addEventListener('click', me.listeners.onHeaderStepClick);
            }
          }
        },
      },
      listeners: {
        observerCallback: function (e) {
          var isAllValidated = false;
          var targetHeaderEl = e.target.closest('.payment-cta').querySelector('.delosi-form-header');
          var headerTitleStr = targetHeaderEl.innerText;
          var targetFormEl = targetHeaderEl.nextElementSibling;
          var circleItem = targetHeaderEl.querySelector('.circle-item');
          var inputEls;

          if (headerTitleStr.indexOf('SELECCIONA TU MÉTODO DE PAGO') > -1) {
            inputEls = targetFormEl.querySelectorAll('input#MetodoPago_FormaPagoSeleccionado[type="hidden"]:not([readonly])');
            for (var i = 0; i < inputEls.length; i++) {
              var inputEl = inputEls[i];
              if (inputEl.getAttribute('aria-invalid') === 'true' || inputEl.getAttribute('aria-invalid') === null) {
                isAllValidated = false;
                break;
              } else {
                isAllValidated = true;
              }
            }
          } else if (headerTitleStr.indexOf('SELECCIONA COMPROBANTE DE PAGO DESEADO') > -1) {
            inputEls = targetFormEl.querySelectorAll('#contenedor-Factura input[type="text"]:not([readonly])');
            for (var i = 0; i < inputEls.length; i++) {
              var inputEl = inputEls[i];
              if (inputEl.getAttribute('aria-invalid') === 'true' || inputEl.getAttribute('aria-invalid') === null) {
                isAllValidated = false;
                break;
              } else {
                isAllValidated = true;
              }
            }
          } else {
            inputEls = targetFormEl.querySelectorAll('input[type="text"]:not([readonly])');
            for (var i = 0; i < inputEls.length; i++) {
              var inputEl = inputEls[i];
              var supEl = inputEl.parentElement.querySelector('.delosi-form-label sup');
              if (supEl !== null) {
                if (inputEl.getAttribute('aria-invalid') === 'true' || inputEl.getAttribute('aria-invalid') === null) {
                  isAllValidated = false;
                  break;
                } else {
                  isAllValidated = true;
                }
              }
            }
          }

          if (isAllValidated) {
            if (headerTitleStr.indexOf('SELECCIONA COMPROBANTE DE PAGO DESEADO') > -1) {
              me.data.allStepsCompleted = true;
              circleItem.classList.add('active');
              me.fn.disableEnableConfirmBtn();
            } else {
              var currentStep = me.data.currentStep;
              var nextStep = currentStep + 1;

              me.data.currentStep = nextStep;

              if (me.data.completedSteps.indexOf(nextStep) === -1) {
                me.data.completedSteps.push(currentStep);
              }

              if (me.data.clickeableSteps.indexOf(nextStep) === -1) {
                me.data.clickeableSteps.push(nextStep);
              }
              me.fn.updateSteps();
            }
          }
        },
        onHeaderStepClick: function (e) {
          var targetEl = e.target;
          var headerStepEl = targetEl.closest('.delosi-form-header');
          var stepStr = targetEl.closest('.delosi-form-header').getAttribute('data-step');
          me.data.currentStep = parseInt(stepStr);

          var headerStepEls = document.querySelectorAll('.delosi-container .checkout-background form#checkoutForm .delosi-form-header');
          for (var i = 0; i < headerStepEls.length; i++) {
            var headerStepEl = headerStepEls[i];
            if (parseInt(headerStepEl.getAttribute('data-step')) !== me.data.currentStep) {
              // headerStepEl.nextElementSibling.style.display = "none";
              headerStepEl.nextElementSibling.classList.remove('active');
              headerStepEl.querySelector('.iconUpDown').innerHTML = '&dtrif;';
            } else {
              // headerStepEl.nextElementSibling.style.display = "block";
              headerStepEl.nextElementSibling.classList.add('active');
              headerStepEl.querySelector('.iconUpDown').innerHTML = '&utrif;';
            }
          }
        },
        onPrivacyCheckboxClick: function (e) {
          var target = e.currentTarget;
          var inputEl = target.querySelector('#TerminoCondiciones.divInput');
          var isActive = inputEl.className.indexOf('active') > -1;

          if (isActive) {
            me.data.privacyChecked = false;
          } else {
            me.data.privacyChecked = true;
          }
          me.fn.disableEnableConfirmBtn();
        },
        onFacturaInputChange: function (e) {
          var target = e.currentTarget;
          var isChecked = target.checked;
          var parentEl = target.closest('.payment-cta');
          var nextBtnEl = parentEl.querySelector('div.btn-next-step');
          var circleItemEl = parentEl.querySelector('.circle-item');
          if (isChecked) {
            circleItemEl.classList.remove('active');
            me.data.allStepsCompleted = false;
          } else {
            circleItemEl.classList.add('active');
          }
          nextBtnEl.classList.toggle('hidden');
          me.fn.disableEnableConfirmBtn();
        },
        onBoletaInputChange: function (e) {
          var target = e.currentTarget;
          var isChecked = target.checked;
          var parentEl = target.closest('.payment-cta');
          var nextBtnEl = parentEl.querySelector('div.btn-next-step');
          var circleItemEl = parentEl.querySelector('.circle-item');

          if (isChecked) {
            me.data.allStepsCompleted = true;
          }
          circleItemEl.classList.add('active');
          nextBtnEl.classList.add('hidden');
          me.fn.disableEnableConfirmBtn();
        },
      },

      run: function () {
        // APLICACION DE ESTILOS EN LINEA CSS
        var nonce = document.querySelector('style[nonce]').nonce;
        var css = `
        <style nonce="${nonce}">
          .checkout-background {
            margin-top: 20px;
          }
          .delosi-form-header {
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          

          .delosi-form-header ~ div{
            display: none;
          }

          .delosi-form-header ~ div.active{
            display: block;
          }

          .delosi-form-header .circle-item{
            background-color: #cccccc !important;
          }
          .delosi-form-header .circle-item.active{
            background-color: #8b2327 !important;
          }

          .iconUpDown{
            font-size: 1.5rem;
            cursor: default;
          }

          .btn-next-step{
            background-color: #8b2327;
          }

          .btn-next-step:hover{
            background-color: #8b2327;
          }

          .btn-next-step.hidden{
            display: none;
          }


          .order-summery.delosi-resumen{
            margin-bottom: 20px;
          }

          .wrapperPayment > .col-12 .iagreeCheckbox{
            display: none;
          }

          .wrapperPayment .iagreeCheckbox{
            display: none;
          }

          .wrapperPayment .payment-cta .iagreeCheckbox{
            display: block;
          }

          .customLabel .divInput{
            width: 20px;
            height: 20px;
            padding: 2px;
            border: 1px solid #000;
            color: #fff
            background-color: transparent;
          }

          .customLabel .divInput.active{
            background-color: #007bff;
            border: none;
          }

          .customLabel .divInput > i{
            display: none;
          }

          .customLabel .divInput.active > i{
            display: block;
            color: #fff;
          }

          a.btn[disabled], button.btn[disabled], input.btn[disabled] {
            background: #ccc!important;
          }

          @media (max-width: 767px) {
            .customLabel{
              display: none;
            }

            .wrapperPayment > .col-12 .iagreeCheckbox{
              display: block;
            }
          }
        </style>
        
        `;
        document.head.insertAdjacentHTML('beforeend', css);

        //  DESHABILITAR EL BOTTON DE SUBMIT
        me.fn.disableEnableConfirmBtn();

        // DESHABILITAR EL CHECKBOX DEL PASO 3
        document.querySelector('#FormaPago5').click();

        //PASOS
        me.fn.updateSteps();

        //LEGAL
        var orderSumEl = document.querySelector('#divCartOrderSummary');
        if (!orderSumEl.querySelectorAll('.customLabel').length > 0) {
          var privPolText = `
          <label for="TerminoCondiciones" class=" customLabel iagreeCheckbox margin-bottom-10 mt-3 ">
            <span class="input-wrapper-checkbox float-left align-self-start">
              <div class="divInput" id="TerminoCondiciones">
              <i>&checkmark;</i>
              </div>
            </span>
            <span class="float-left register-checkbox-text text-justify bk-FlameSans-Regular bk-color-marron">
                He leído y acepto la
                <a class="enlace-color bk-color-marron" href="/politicas-privacidad" target="_blank"> Política de Privacidad.</a>*
                <span class="text-danger help-block text-left field-validation-error" data-valmsg-for="TerminoCondiciones" data-valmsg-replace="true">
                  <span id="TerminoCondiciones-error" class="font-size13"></span>
                </span>
            </span>
          </label>
          `;
          var dataTreatmentText = `
          <label for="TratamientoDatos" class="customLabel iagreeCheckbox margin-bottom-10 mt-3">
            <span class="input-wrapper-checkbox float-left align-self-start">
              <div class="divInput" id="TratamientoDatos">
                <i>&checkmark;</i>
              </div>
            </span>
            <span class="float-left register-checkbox-text text-justify bk-FlameSans-Regular bk-color-marron">
              Autorizo el tratamiento de mis datos para fines de prospección y promoción comercial por parte de Madam Tusan
              y sus <a class="enlace-color bk-color-marron" href="/tratamiento-de-mis-datos" target="_blank">Empresas Vinculadas</a>
            </span>
          </label>
          `;
          orderSumEl.insertAdjacentHTML('beforeend', privPolText);
          orderSumEl.insertAdjacentHTML('beforeend', dataTreatmentText);

          atm.util.seekFor('.customLabel', { tries: 25, delay: 200 }, function (labelEls) {
            for (var i = 0; i < labelEls.length; i++) {
              var labelEl = labelEls[i];
              labelEl.addEventListener('click', function (e) {
                var targetEl = e.target;
                var targetInputEl = targetEl.closest('.customLabel').querySelector('.divInput');
                targetInputEl.classList.toggle('active');
              });
            }
          });
        }

        // Listener a checkbox politica de privacidad
        var privacyCheckbox = document.querySelector('label.customLabel.iagreeCheckbox');
        if (privacyCheckbox) {
          privacyCheckbox.removeEventListener('click', me.listeners.onPrivacyCheckboxClick);
          privacyCheckbox.addEventListener('click', me.listeners.onPrivacyCheckboxClick);
        }

        // Listener a checkbox de boleta
        var inputBoletaEl = document.querySelector('#DatosComprobante_EsBoleta');
        if (inputBoletaEl) {
          inputBoletaEl.removeEventListener('change', me.listeners.onBoletaInputChange);
          inputBoletaEl.addEventListener('change', me.listeners.onBoletaInputChange);
        }
        // Listener a checkbox de factura
        var inputFacturaEl = document.querySelector('#DatosComprobante_EsFactura');
        if (inputFacturaEl) {
          inputFacturaEl.removeEventListener('change', me.listeners.onFacturaInputChange);
          inputFacturaEl.addEventListener('change', me.listeners.onFacturaInputChange);
        }
      },
    };
    return me;
  })().run();
}